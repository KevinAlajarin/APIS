const express = require('express');
const router = express.Router();
const { getTrainerStats } = require('../controllers/statsController');
const authenticate = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');

// Cambiamos el endpoint a /api/stats/trainers/{id}/metrics
router.get('/trainers/:id/metrics', authenticate, checkRole([3]), getTrainerStats);

/**
 * @swagger
 * tags:
 *   - name: Statistics
 *     description: System statistics and metrics
 */

/**
 * @swagger
 * /api/stats/trainers/{id}/metrics:
 *   get:
 *     summary: Get trainer performance metrics
 *     description: Returns detailed statistics and metrics for a specific trainer
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Trainer ID
 *     responses:
 *       200:
 *         description: Trainer metrics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalViews:
 *                   type: integer
 *                   example: 150
 *                 conversionRate:
 *                   type: number
 *                   format: float
 *                   example: 12.5
 *                 averageRating:
 *                   type: number
 *                   format: float
 *                   example: 4.5
 *                 totalReviews:
 *                   type: integer
 *                   example: 20
 *                 ratingDistribution:
 *                   type: array
 *                   items: 
 *                     type: integer
 *                   example: [1, 2, 3, 10, 4]
 *                 popularServices:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       serviceId:
 *                         type: integer
 *                         example: 123
 *                       description:
 *                         type: string
 *                         example: "Personal Training"
 *                       totalHires:
 *                         type: integer
 *                         example: 15
 *                       views:
 *                         type: integer
 *                         example: 75
 *       403:
 *         description: Forbidden (not a trainer or not authorized)
 *       404:
 *         description: Trainer not found
 *       500:
 *         description: Server error
 */
module.exports = router;