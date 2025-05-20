const express = require('express');
const router = express.Router();
const { 
  getChatMessages, 
  sendChatMessage,
  uploadChatFile, 
  getChatFiles 
} = require('../controllers/chatController');
const authenticate = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multerMiddleware');

// Middleware de autenticación aplicado a todas las rutas
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   - name: Chat
 *     description: Chat and file sharing system for hires
 *   - name: Files
 *     description: File management for hires
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         text:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         user_id:
 *           type: integer
 *         user_name:
 *           type: string
 *         user_role:
 *           type: integer
 *     File:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         type:
 *           type: string
 *         upload_date:
 *           type: string
 *           format: date-time
 *         uploaded_by:
 *           type: string
 *         url:
 *           type: string
 */

// Endpoints actualizados
router.get('/hires/:id/messages', getChatMessages);
router.post('/hires/:id/messages', sendChatMessage);
router.post('/hires/:id/files', upload.single('file'), uploadChatFile);
router.get('/hires/:id/files', getChatFiles);

/**
 * @swagger
 * /api/hires/{id}/messages:
 *   get:
 *     summary: Get chat messages for a hire
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Hire ID
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       403:
 *         description: Unauthorized access
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/hires/{id}/messages:
 *   post:
 *     summary: Send a chat message
 *     tags: [Chat]
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
 *                 example: "Hello, how are you?"
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 id:
 *                   type: integer
 *       400:
 *         description: Empty message
 *       403:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/hires/{id}/files:
 *   post:
 *     summary: Upload a file to hire
 *     tags: [Files]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/File'
 *       400:
 *         description: No file uploaded
 *       403:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/hires/{id}/files:
 *   get:
 *     summary: Get files for a hire
 *     tags: [Files]
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
 *         description: List of files
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/File'
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Hire not found
 */

module.exports = router;