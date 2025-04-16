const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const servicesController = require('../controllers/servicesController');
const authenticate = require('../middlewares/authMiddleware');

// Validaciones comunes
const serviceValidations = [
  check('id_categoria').isInt().withMessage('Categoría inválida'),
  check('id_zona').isInt().withMessage('Zona inválida'),
  check('descripcion').isLength({ min: 10 }).withMessage('Descripción muy corta'),
  check('precio').isFloat({ gt: 0 }).withMessage('Precio debe ser positivo'),
  check('duracion').isIn([15, 30, 60]).withMessage('Duración inválida'),
  check('idioma').isIn(['Español', 'Inglés']).withMessage('Idioma no soportado'),
  check('modalidad').isIn(['virtual', 'presencial']).withMessage('Modalidad inválida'),
  check('fecha_hora_inicio').isISO8601().withMessage('Fecha inicio inválida (usar formato ISO)'),
  check('fecha_hora_fin').isISO8601().withMessage('Fecha fin inválida (usar formato ISO)')
];

// Rutas públicas
router.get('/', servicesController.searchServices);
router.get('/:id', servicesController.getService);

// Rutas protegidas (requieren JWT)
router.use(authenticate);

router.post('/', serviceValidations, servicesController.createService);
router.put('/:id', serviceValidations, servicesController.updateService);
router.delete('/:id', servicesController.deleteService);

module.exports = router;