const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/pagosController');
const authenticate = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing with MercadoPago
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentPreference:
 *       type: object
 *       properties:
 *         preference_id:
 *           type: string
 *           example: "1315617318-9b8a1a1a-..."
 *         payment_url:
 *           type: string
 *           example: "https://www.mercadopago.com.ar/checkout/v1/redirect..."
 *         hire_id:
 *           type: integer
 *           example: 1
 */

// Endpoints actualizados
router.post('/preferences', authenticate, paymentsController.createPaymentPreference);
router.post('/webhook', paymentsController.handlePaymentWebhook);

/**
 * @swagger
 * /api/payments/preferences:
 *   post:
 *     summary: Create MercadoPago payment preference
 *     tags: [Payments]
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
 *             properties:
 *               hire_id:
 *                 type: integer
 *                 example: 1
 *                 description: "ID of the hire to pay"
 *     responses:
 *       200:
 *         description: Payment preference created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentPreference'
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Hire not found
 *       500:
 *         description: Error creating payment preference
 */

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: MercadoPago payment notification webhook
 *     description: Endpoint for MercadoPago payment notifications (do not call directly)
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Webhook processed
 *       400:
 *         description: Invalid webhook data
 *       403:
 *         description: Unauthorized webhook call
 */
module.exports = router;