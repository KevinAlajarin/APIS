// server/src/controllers/reseniasController.js
const Resenia = require('../models/Resenia');
const { validationResult } = require('express-validator');

const crearResenia = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Solo clientes pueden crear reseñas
    if (req.user.id_rol !== 2) {
      return res.status(403).json({ error: 'Solo clientes pueden crear reseñas' });
    }

    const { id_contratacion, puntuacion, comentario } = req.body;
    const id_resenia = await Resenia.create(
      id_contratacion,
      req.user.id_usuario,
      puntuacion,
      comentario
    );

    res.status(201).json({ id_resenia });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

const getReseniasEntrenador = async (req, res) => {
  try {
    const resenias = await Resenia.getByEntrenador(req.params.id);
    res.json(resenias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener reseñas' });
  }
};

const responderResenia = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Solo entrenadores pueden responder
    if (req.user.id_rol !== 3) {
      return res.status(403).json({ error: 'Solo entrenadores pueden responder reseñas' });
    }

    const { texto } = req.body;
    await Resenia.addRespuesta(
      req.params.id,
      req.user.id_usuario,
      texto
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

const getReseniasCliente = async (req, res) => {
    try {
      const resenias = await Resenia.getByCliente(req.params.id);  // Usar params.id
      res.json(resenias);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener reseñas' });
    }
  };
  
  // Nuevo método para eliminar reseñas
  const eliminarResenia = async (req, res) => {
    try {
      const esAdmin = req.user.id_rol === 1;
      await Resenia.delete(
        req.params.id,
        req.user.id_usuario,
        esAdmin
      );
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  };

module.exports = {
  crearResenia,
  getReseniasEntrenador,
  responderResenia,
  getReseniasCliente,
  eliminarResenia
};