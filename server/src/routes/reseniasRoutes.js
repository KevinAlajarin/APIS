// server/src/routes/reseniasRoutes.js
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
  crearResenia,
  getReseniasEntrenador,
  getReseniasCliente,
  eliminarResenia,
  responderResenia
} = require('../controllers/reseniasController');
const authenticate = require('../middlewares/authMiddleware');

// Validaciones
const reseniaValidations = [
  check('id_contratacion').isInt().withMessage('ID de contratación inválido'),
  check('puntuacion').isInt({ min: 1, max: 5 }).withMessage('Puntuación debe ser entre 1 y 5'),
  check('comentario').isLength({ min: 10 }).withMessage('Comentario muy corto (mín. 10 caracteres)')
];

const respuestaValidations = [
  check('texto').isLength({ min: 5 }).withMessage('Respuesta muy corta (mín. 5 caracteres)')
];

// Rutas públicas
router.get('/entrenadores/:id/resenias', getReseniasEntrenador);
router.get('/clientes/:id/resenias', getReseniasCliente);  

// Rutas protegidas
router.use(authenticate);

router.delete('/:id', eliminarResenia);



router.post('/', reseniaValidations, crearResenia);
router.post('/:id/respuestas', respuestaValidations, responderResenia);

/**
 * @swagger
 * tags:
 *   - name: Reseñas
 *     description: Sistema de reseñas y respuestas
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Reseña:
 *       type: object
 *       properties:
 *         id_resenia:
 *           type: integer
 *         puntuacion:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         comentario:
 *           type: string
 *         cliente_nombre:
 *           type: string
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *     Respuesta:
 *       type: object
 *       properties:
 *         texto:
 *           type: string
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/resenias:
 *   post:
 *     summary: Crear reseña (solo clientes con contratación completada)
 *     tags: [Reseñas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_contratacion
 *               - puntuacion
 *               - comentario
 *             properties:
 *               id_contratacion:
 *                 type: integer
 *               puntuacion:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comentario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reseña creada
 *       400:
 *         description: |
 *           Posibles errores:
 *           - Contratación no encontrada
 *           - Servicio no completado
 *           - Ya existe una reseña
 *       403:
 *         description: No autorizado (solo clientes)
 */

/**
 * @swagger
 * /api/resenias/{id}/respuestas:
 *   post:
 *     summary: Responder reseña (solo entrenador dueño del servicio)
 *     tags: [Reseñas]
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
 *               - texto
 *             properties:
 *               texto:
 *                 type: string
 *     responses:
 *       200:
 *         description: Respuesta agregada
 *       403:
 *         description: No autorizado (solo entrenador dueño)
 */

/**
 * @swagger
 * /api/resenias/entrenadores/{id}/resenias:
 *   get:
 *     summary: Obtener reseñas de un entrenador
 *     tags: [Reseñas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de reseñas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reseña'
 */

/**
 * @swagger
 * /api/resenias/clientes/{id}/resenias:
 *   get:
 *     summary: Obtener reseñas de un cliente 
 *     tags: [Reseñas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Lista de reseñas del cliente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reseña'
 *       404:
 *         description: Cliente no encontrado
 */

/**
 * @swagger
 * /api/resenias/{id}:
 *   delete:
 *     summary: Eliminar reseña (admin, cliente autor o entrenador dueño)
 *     tags: [Reseñas]
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
 *         description: Reseña eliminada
 *       403:
 *         description: No autorizado
 */

module.exports = router;