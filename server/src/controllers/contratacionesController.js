const Hire = require('../models/Contratacion');
const { validationResult } = require('express-validator');
const { getConnection, sql } = require('../config/db');

const createHire = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Only clients can create hires
    if (req.user.id_rol !== 2) {
      return res.status(403).json({ error: 'Only clients can hire services' });
    }

    const { service_id } = req.body;
    const result = await Hire.create(req.user.id_usuario, service_id);

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

const getUserHires = async (req, res) => {
  try {
    const hires = await Hire.getByUser(req.user.id_usuario);
    res.json(hires);
  } catch (error) {
    console.error('Error in getUserHires:', error.message);
    res.status(500).json({ error: 'Error getting hires' });
  }
};

const getHireDetails = async (req, res) => {
  try {
    const hire = await Hire.getById(req.params.id);
    
    // Verify permissions
    const pool = await getConnection(); 
    const serviceResult = await pool.request()
      .input('id_servicio', sql.Int, hire.id_servicio)
      .query('SELECT id_entrenador FROM servicios WHERE id_servicio = @id_servicio');

    const canView = req.user.id_usuario === hire.id_cliente || 
                  req.user.id_usuario === serviceResult.recordset[0].id_entrenador;

    if (!canView) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(hire);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error getting hire details' });
  }
};

const updateHireStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Status mapping (English -> Spanish)
    const statusMap = {
      'accepted': 'aceptado',
      'cancelled': 'cancelado', 
      'completed': 'completado'
    };
    
    await Hire.updateEstado(
      req.params.id, 
      statusMap[status],
      req.user.id_usuario
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

const completeHire = async (req, res) => {
  try {
    // Verify trainer role
    if (req.user.id_rol !== 3) {
      return res.status(403).json({ error: 'Solo entrenadores pueden completar el servicio' });
    }

    // Verify trainer owns the service
    const pool = await getConnection();
    const valid = await pool.request()
      .input('id_contratacion', sql.Int, req.params.id)
      .input('id_entrenador', sql.Int, req.user.id_usuario)
      .query(`
        SELECT 1 
        FROM contrataciones c
        JOIN servicios s ON c.id_servicio = s.id_servicio
        WHERE c.id_contratacion = @id_contratacion
          AND s.id_entrenador = @id_entrenador
      `);

    if (!valid.recordset[0]) {
      return res.status(403).json({ error: 'Entrenador incorrecto' });
    }

    // Update status
    await Hire.updateEstado(req.params.id, 'completado', req.user.id_usuario);
    
    res.json({ 
      success: true,
      message: 'Servicio marcado como completado'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createHire,
  getUserHires,
  getHireDetails,
  updateHireStatus,
  completeHire
};