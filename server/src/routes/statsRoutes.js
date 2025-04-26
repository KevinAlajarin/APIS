// server/src/routes/statsRoutes.js
const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/statsController');
const authenticate = require('../middlewares/authMiddleware');

router.use(authenticate);

router.get('/entrenadores/estadisticas', getStats);

/**
 * @swagger
 * /api/stats/entrenadores/estadisticas:
 *   get:
 *     summary: Obtener estadísticas del entrenador
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas del entrenador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_visualizaciones:
 *                   type: integer
 *                 tasa_conversion:
 *                   type: number
 *                 promedio_calificaciones:
 *                   type: number
 *                 total_calificaciones:
 *                   type: integer
 *                 distribucion_calificaciones:
 *                   type: array
 *                   items: { type: integer }
 *                 servicios_populares:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_servicio:
 *                         type: integer
 *                       descripcion:
 *                         type: string
 *                       total_contrataciones:
 *                         type: integer
 *                       visualizaciones:
 *                         type: integer
 */
module.exports = router;