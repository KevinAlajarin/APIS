const express = require('express');
const router = express.Router();
const pagosController = require('../controllers/pagosController');
const autenticar = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Pagos
 *   description: Gestión de pagos con MercadoPago
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PreferenciaPago:
 *       type: object
 *       properties:
 *         id_preferencia:
 *           type: string
 *           example: "1315617318-9b8a1a1a-..."
 *         url_pago:
 *           type: string
 *           example: "https://www.mercadopago.com.ar/checkout/v1/redirect..."
 */

/**
 * @swagger
 * /api/pagos/crear-preferencia:
 *   post:
 *     summary: Crea una preferencia de pago en MercadoPago
 *     tags: [Pagos]
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
 *             properties:
 *               id_contratacion:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Preferencia creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PreferenciaPago'
 */
router.post('/crear-preferencia', autenticar, pagosController.crearPreferenciaPago);

/**
 * @swagger
 * /api/pagos/webhook:
 *   post:
 *     summary: Webhook para notificaciones de MercadoPago
 *     tags: [Pagos]
 *     responses:
 *       200:
 *         description: Webhook procesado
 */
router.post('/webhook', pagosController.manejarWebhook);

module.exports = router;