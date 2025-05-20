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
router.patch('/:id', servicesController.partialUpdateService); 
router.delete('/:id', servicesController.deleteService);

module.exports = router;

/**
 * @swagger
 * tags:
 *   - name: Services
 *     description: Training services management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         description:
 *           type: string
 *           example: "Clases personalizadas de yoga"
 *         price:
 *           type: number
 *           format: float
 *           example: 1500.50
 *         duration:
 *           type: integer
 *           example: 60
 *         modality:
 *           type: string
 *           enum: [virtual, presencial]
 *         language:
 *           type: string
 *           enum: [Español, Inglés]
 *         category:
 *           type: string
 *           example: "Yoga"
 *         zone:
 *           type: string
 *           example: "Palermo"
 *         trainer:
 *           type: string
 *           example: "María Lopez"
 *         averageRating:
 *           type: number
 *           format: float
 *           minimum: 1
 *           maximum: 5
 *           example: 4.5
 *         startDateTime:
 *           type: string
 *           format: date-time
 *           example: "2023-12-01T10:00:00"
 *         endDateTime:
 *           type: string
 *           format: date-time
 *           example: "2023-12-01T11:00:00"
 */

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Search services with filters
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: "Filter by category name (e.g. 'Yoga')"
 *       - in: query
 *         name: zona
 *         schema:
 *           type: string
 *         description: "Filter by zone name (e.g. 'Palermo')"
 *       - in: query
 *         name: modalidad
 *         schema:
 *           type: string
 *           enum: [virtual, presencial]
 *         description: "Filter by service modality"
 *       - in: query
 *         name: idioma
 *         schema:
 *           type: string
 *           enum: [Español, Inglés]
 *         description: "Filter by service language"
 *       - in: query
 *         name: duracion
 *         schema:
 *           type: integer
 *           enum: [15, 30, 60]
 *         description: "Filter by duration in minutes"
 *       - in: query
 *         name: calificacion_minima
 *         schema:
 *           type: number
 *           format: float
 *           minimum: 1
 *           maximum: 5
 *         description: "Filter by minimum average rating (1-5)"
 *       - in: query
 *         name: precioMax
 *         schema:
 *           type: number
 *           format: float
 *         description: "Filter by maximum price"
 *     responses:
 *       200:
 *         description: Filtered services list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 *               example:
 *                 - id: 1
 *                   description: "Clases personalizadas de yoga"
 *                   price: 1500.50
 *                   duration: 60
 *                   modality: "presencial"
 *                   language: "Español"
 *                   category: "Yoga"
 *                   zone: "Palermo"
 *                   trainer: "María Lopez"
 *                   averageRating: 4.5
 *                 - id: 2
 *                   description: "Entrenamiento funcional virtual"
 *                   price: 1200
 *                   duration: 30
 *                   modality: "virtual"
 *                   language: "Inglés"
 *                   category: "Funcional"
 *                   zone: "Virtual"
 *                   trainer: "Juan Perez"
 *                   averageRating: 4.8
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Create a new service (Authentication required)
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
 *                 description: "Category ID"
 *               id_zona:
 *                 type: integer
 *                 example: 1
 *                 description: "Zone ID"
 *               descripcion:
 *                 type: string
 *                 example: "Clases avanzadas de yoga"
 *                 description: "Service description"
 *               precio:
 *                 type: number
 *                 example: 2000
 *                 description: "Service price"
 *               duracion:
 *                 type: integer
 *                 enum: [15, 30, 60]
 *                 example: 60
 *                 description: "Duration in minutes"
 *               idioma:
 *                 type: string
 *                 enum: [Español, Inglés]
 *                 description: "Service language"
 *               modalidad:
 *                 type: string
 *                 enum: [virtual, presencial]
 *                 description: "Service modality"
 *               fecha_hora_inicio:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-12-01T10:00:00"
 *                 description: "Start date and time"
 *               fecha_hora_fin:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-12-01T11:00:00"
 *                 description: "End date and time"
 *     responses:
 *       201:
 *         description: Service created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_servicio:
 *                   type: integer
 *                   example: 1
 *                   description: "ID of the created service"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Get service by ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Service details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */


/**
 * @swagger
 * /api/services/{id}:
 *   put:
 *     summary: Fully update a service (Authentication required)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: "Service ID"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden (not the service owner)
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/services/{id}:
 *   delete:
 *     summary: Delete a service (Authentication required)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: "Service ID"
 *     responses:
 *       204:
 *         description: Service deleted successfully (no content)
 *       403:
 *         description: Forbidden (not the service owner)
 *       404:
 *         description: Service not found
 *       409:
 *         description: Conflict (service has associated contracts)
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/services/{id}:
 *   patch:
 *     summary: Partially update a service
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               active:
 *                 type: boolean
 *                 description: "Service status"
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Service updated
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
