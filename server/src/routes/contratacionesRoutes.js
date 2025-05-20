const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
  createHire,
  getUserHires,
  getHireDetails,
  updateHireStatus,
  completeHire
} = require('../controllers/contratacionesController');
const authenticate = require('../middlewares/authMiddleware');

// Validaciones
const createValidations = [
  check('service_id').isInt().withMessage('Debe ser un ID de servicio válido').toInt()
];

const statusValidations = [
  check('status')
    .isIn(['accepted', 'cancelled', 'completed'])
    .withMessage('Estado inválido. Valores permitidos: accepted, cancelled, completed')
];

/**
 * @swagger
 * tags:
 *   - name: Hires
 *     description: Service hiring management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Hire:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [pending, accepted, cancelled, completed]
 *         request_date:
 *           type: string
 *           format: date-time
 *         service_id:
 *           type: integer
 *         service_description:
 *           type: string
 *         price:
 *           type: number
 *           format: float
 *         trainer_name:
 *           type: string
 */

// Endpoints actualizados
router.post('/', authenticate, createValidations, createHire);
router.get('/', authenticate, getUserHires);
router.get('/:id', authenticate, getHireDetails);
router.patch('/:id/status', authenticate, statusValidations, updateHireStatus);
router.patch('/:id/complete', authenticate, completeHire);

/**
 * @swagger
 * /api/hires:
 *   post:
 *     summary: Create new hire (clients only)
 *     tags: [Hires]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - service_id
 *             properties:
 *               service_id:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Hire created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hire'
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden (not a client or unauthorized)
 */

/**
 * @swagger
 * /api/hires:
 *   get:
 *     summary: Get hires for authenticated user
 *     tags: [Hires]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of hires
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hire'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/hires/{id}:
 *   get:
 *     summary: Get hire details
 *     tags: [Hires]
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
 *         description: Hire details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hire'
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Hire not found
 */

/**
 * @swagger
 * /api/hires/{id}/status:
 *   patch:
 *     summary: Update hire status
 *     tags: [Hires]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, cancelled, completed]
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid status transition
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /api/hires/{id}/complete:
 *   patch:
 *     summary: Mark hire as completed (trainers only)
 *     tags: [Hires]
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
 *         description: Hire completed
 *       403:
 *         description: Forbidden (not the trainer)
 */
module.exports = router;