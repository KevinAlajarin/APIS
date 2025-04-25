// server/src/controllers/contratacionesController.js
const Contratacion = require('../models/Contratacion');
const { validationResult } = require('express-validator');
const { getConnection, sql } = require('../config/db');

const crearContratacion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Solo clientes pueden crear contrataciones
    if (req.user.id_rol !== 2) {
      return res.status(403).json({ error: 'Solo clientes pueden contratar servicios' });
    }

    const { id_servicio } = req.body;
    const result = await Contratacion.create(req.user.id_usuario, id_servicio);

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

const listarContrataciones = async (req, res) => {
    try {
      // Validación adicional
      if (!req.user || !req.user.id_usuario) {
        return res.status(401).json({ error: 'No autenticado' });
      }
  
      const contrataciones = await Contratacion.getByUser(req.user.id_usuario);
      res.json(contrataciones);
    } catch (error) {
      console.error('Error en listarContrataciones:', error.message);
      res.status(500).json({ error: 'Error al obtener contrataciones' });
    }
  };

  const obtenerContratacion = async (req, res) => {
    try {
      const contratacion = await Contratacion.getById(req.params.id);
  
      // Verificar permisos 
      const pool = await getConnection(); 
      const servicioResult = await pool.request()
        .input('id_servicio', sql.Int, contratacion.id_servicio)
        .query('SELECT id_entrenador FROM servicios WHERE id_servicio = @id_servicio');
  
      const puedeVer = req.user.id_usuario === contratacion.id_cliente || 
                      req.user.id_usuario === servicioResult.recordset[0].id_entrenador;
  
      if (!puedeVer) {
        return res.status(403).json({ error: 'No autorizado' });
      }
  
      res.json(contratacion);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener contratación' });
    }
  };

const cambiarEstado = async (req, res) => {
    try {
      const { nuevoEstado } = req.body;
      
      // 1. Cambiar estado
      await Contratacion.updateEstado(
        req.params.id, 
        nuevoEstado, 
        req.user.id_usuario
      );
  
      // 2. Si es cancelado, reactivar servicio
      if (nuevoEstado === 'cancelado') {
        const contratacion = await Contratacion.getById(req.params.id);
        await Service.updateServiceStatus(contratacion.id_servicio, 1);
      }
  
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  };

module.exports = {
  crearContratacion,
  listarContrataciones,
  obtenerContratacion,
  cambiarEstado
};