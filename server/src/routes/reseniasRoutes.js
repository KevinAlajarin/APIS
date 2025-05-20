const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
  createReview,
  getTrainerReviews,
  getClientReviews,
  deleteReview,
  addReviewResponse
} = require('../controllers/reseniasController');
const authenticate = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');

// Validaciones
const reviewValidations = [
  check('hire_id').isInt().withMessage('ID de contratación inválido'),
  check('rating').isInt({ min: 1, max: 5 }).withMessage('Puntuación debe ser entre 1 y 5'),
  check('comment').isLength({ min: 10 }).withMessage('Comentario muy corto (mín. 10 caracteres)')
];

const responseValidations = [
  check('text').isLength({ min: 5 }).withMessage('Respuesta muy corta (mín. 5 caracteres)')
];

/**
 * @swagger
 * tags:
 *   - name: Reviews
 *     description: Service review system
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         comment:
 *           type: string
 *         client_name:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         response:
 *           type: string
 *         response_date:
 *           type: string
 *           format: date-time
 *         trainer_response_name:
 *           type: string
 */

// Endpoints públicos
router.get('/trainers/:id/reviews', getTrainerReviews);
router.get('/clients/:id/reviews', getClientReviews);

// Endpoints protegidos
router.use(authenticate);

router.post('/', reviewValidations, checkRole([2]), createReview);
router.post('/:id/responses', responseValidations, checkRole([3]), addReviewResponse);
router.delete('/:id', deleteReview);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a review (completed hires only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hire_id
 *               - rating
 *               - comment
 *             properties:
 *               hire_id:
 *                 type: integer
 *                 example: 1
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: "Excelente servicio"
 *     responses:
 *       201:
 *         description: Review created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Validation error or business rule violation
 *       403:
 *         description: Forbidden (clients only)
 */

/**
 * @swagger
 * /api/reviews/trainers/{id}/reviews:
 *   get:
 *     summary: Get reviews for a trainer
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/reviews/clients/{id}/reviews:
 *   get:
 *     summary: Get reviews by a client
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of client reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       404:
 *         description: Client not found
 */

/**
 * @swagger
 * /api/reviews/{id}/responses:
 *   post:
 *     summary: Add response to a review (service trainer only)
 *     tags: [Reviews]
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
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Gracias por tu feedback"
 *     responses:
 *       200:
 *         description: Response added
 *       403:
 *         description: Forbidden (not the trainer)
 */

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review (admin, client author or service trainer)
 *     tags: [Reviews]
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
 *         description: Review deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Review not found
 */

module.exports = router;