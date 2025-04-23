// server/src/routes/contratacionesRoutes.js
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
  crearContratacion,
  listarContrataciones,
  obtenerContratacion,
  cambiarEstado
} = require('../controllers/contratacionesController');
const authenticate = require('../middlewares/authMiddleware');
const debugMiddleware = require('../middlewares/debugMiddleware');
router.post('/', authenticate, crearContratacion);

router.use(authenticate);

/**
 * @swagger
 * components:
 *   schemas:
 *     Contratacion:
 *       type: object
 *       properties:
 *         id_contratacion:
 *           type: integer
 *         estado:
 *           type: string
 *           enum: [pendiente, aceptado, cancelado, completado]
 *         fecha_solicitud:
 *           type: string
 *           format: date-time
 *         id_servicio:
 *           type: integer
 *         servicio_descripcion:
 *           type: string
 *         precio:
 *           type: number
 *           format: float
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Mensaje de error descriptivo"
 */

// Validaciones
const crearValidations = [
  check('id_servicio')
    .isInt().withMessage('Debe ser un ID de servicio válido')
    .toInt()
];

const estadoValidations = [
  check('nuevoEstado')
    .isIn(['aceptado', 'cancelado', 'completado'])
    .withMessage('Estado inválido. Valores permitidos: aceptado, cancelado, completado')
];

/**
 * @swagger
 * /api/contrataciones:
 *   post:
 *     summary: Crear nueva contratación (solo clientes)
 *     tags: [Contrataciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_servicio
 *             properties:
 *               id_servicio:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Contratación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contratacion'
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               servicio_no_disponible:
 *                 value:
 *                   error: "El servicio no está disponible para contratación"
 *               autocontratacion:
 *                 value:
 *                   error: "No puedes contratar tu propio servicio"
 *               validacion:
 *                 value:
 *                   error: "Debe ser un ID de servicio válido"
 *       403:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Solo clientes pueden contratar servicios"
 */

router.post('/', crearValidations, crearContratacion);

/**
 * @swagger
 * /api/contrataciones:
 *   get:
 *     summary: Listar contrataciones del usuario autenticado
 *     tags: [Contrataciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de contrataciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contratacion'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', listarContrataciones);

/**
 * @swagger
 * /api/contrataciones/{id}:
 *   get:
 *     summary: Obtener detalles de una contratación específica
 *     tags: [Contrataciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles de la contratación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contratacion'
 *       403:
 *         description: No autorizado para ver esta contratación
 *       404:
 *         description: Contratación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', obtenerContratacion);

/**
 * @swagger
 * /api/contrataciones/{id}/estado:
 *   patch:
 *     summary: Cambiar estado de una contratación
 *     tags: [Contrataciones]
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
 *             type: object
 *             required:
 *               - nuevoEstado
 *             properties:
 *               nuevoEstado:
 *                 type: string
 *                 enum: [aceptado, cancelado, completado]
 *                 example: "aceptado"
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               estado_invalido:
 *                 value:
 *                   error: "Transición de estado no permitida: pendiente -> completado"
 *               validacion:
 *                 value:
 *                   error: "Estado inválido. Valores permitidos: aceptado, cancelado, completado"
 *       403:
 *         description: No autorizado para esta acción
 *       500:
 *         description: Error del servidor
 */
router.patch('/:id/estado', estadoValidations, cambiarEstado);

module.exports = router;