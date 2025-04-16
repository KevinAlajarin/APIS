const Service = require('../models/Service');
const { validationResult } = require('express-validator');

const createService = async (req, res) => {
  // Validación de campos (usando express-validator)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const serviceData = {
      id_entrenador: req.user.id_usuario, // Asume que el JWT incluye el ID
      ...req.body
    };

    const id_servicio = await Service.create(serviceData);
    res.status(201).json({ id_servicio });
  } catch (error) {
    console.error('Error en createService:', error.message);
    res.status(500).json({ error: error.message || 'Error al crear servicio' });
  }
};

const getService = async (req, res) => {
  try {
    const service = await Service.getById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    res.json(service);
  } catch (error) {
    console.error('Error en getService:', error.message);
    res.status(500).json({ error: 'Error al obtener servicio' });
  }
};

const updateService = async (req, res) => {
  try {
    // Verificar que el servicio pertenece al entrenador
    const service = await Service.getById(req.params.id);
    if (!service || service.id_entrenador !== req.user.id_usuario) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    await Service.update(req.params.id, req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Error en updateService:', error.message);
    res.status(500).json({ error: 'Error al actualizar servicio' });
  }
};

const deleteService = async (req, res) => {
  try {
    // Verificar propiedad del servicio
    const service = await Service.getById(req.params.id);
    if (!service || service.id_entrenador !== req.user.id_usuario) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    await Service.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error en deleteService:', error.message);
    res.status(500).json({ error: 'Error al eliminar servicio' });
  }
};

const searchServices = async (req, res) => {
  try {
    const services = await Service.search(req.query); // Filtros vienen en query params
    res.json(services);
  } catch (error) {
    console.error('Error en searchServices:', error.message);
    res.status(500).json({ error: 'Error en búsqueda' });
  }
};

module.exports = {
  createService,
  getService,
  updateService,
  deleteService,
  searchServices
};