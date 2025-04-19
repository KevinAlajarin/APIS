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

/**
 * @swagger
 * tags:
 *   - name: Services
 *     description: Gestión de servicios de entrenadores
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       properties:
 *         id_servicio:
 *           type: integer
 *           example: 1
 *         descripcion:
 *           type: string
 *           example: "Clases personalizadas de yoga"
 *         precio:
 *           type: number
 *           format: float
 *           example: 1500.50
 *         duracion:
 *           type: integer
 *           example: 60
 *         modalidad:
 *           type: string
 *           enum: [virtual, presencial]
 *         idioma:
 *           type: string
 *           enum: [Español, Inglés]
 *         categoria:
 *           type: string
 *           example: "Yoga"
 *         zona:
 *           type: string
 *           example: "Palermo"
 *         entrenador:
 *           type: string
 *           example: "María Lopez"
 */

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Buscar servicios con filtros
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: "Nombre de categoría (ej: Yoga)"
 *       - in: query
 *         name: zona
 *         schema:
 *           type: string
 *         description: "Nombre de zona (ej: Palermo)"
 *       - in: query
 *         name: modalidad
 *         schema:
 *           type: string
 *           enum: [virtual, presencial]
 *     responses:
 *       200:
 *         description: Lista de servicios filtrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 */

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Crear un nuevo servicio (Requiere autenticación)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_categoria
 *               - id_zona
 *               - descripcion
 *               - precio
 *               - duracion
 *               - idioma
 *               - modalidad
 *               - fecha_hora_inicio
 *               - fecha_hora_fin
 *             properties:
 *               id_categoria:
 *                 type: integer
 *                 example: 1
 *               id_zona:
 *                 type: integer
 *                 example: 1
 *               descripcion:
 *                 type: string
 *                 example: "Clases avanzadas de yoga"
 *               precio:
 *                 type: number
 *                 example: 2000
 *               duracion:
 *                 type: integer
 *                 enum: [15, 30, 60]
 *                 example: 60
 *               idioma:
 *                 type: string
 *                 enum: [Español, Inglés]
 *               modalidad:
 *                 type: string
 *                 enum: [virtual, presencial]
 *               fecha_hora_inicio:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-12-01T10:00:00"
 *               fecha_hora_fin:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-12-01T11:00:00"
 *     responses:
 *       201:
 *         description: Servicio creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_servicio:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Obtener un servicio por ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles del servicio
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       404:
 *         description: Servicio no encontrado
 */


/**
 * @swagger
 * /api/services/{id}:
 *   put:
 *     summary: Actualizar un servicio (Requiere autenticación)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       200:
 *         description: Servicio actualizado
 *       403:
 *         description: No tienes permisos para editar este servicio
 *       404:
 *         description: Servicio no encontrado
 */

/**
 * @swagger
 * /api/services/{id}:
 *   delete:
 *     summary: Eliminar un servicio (Requiere autenticación)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Servicio eliminado permanentemente
 *       403:
 *         description: No tienes permisos para eliminar este servicio
 *       404:
 *         description: Servicio no encontrado
 *       409:
 *         description: No se puede eliminar porque tiene contrataciones asociadas
 */