// server/src/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { getChat, sendMessage, uploadFile, getFiles } = require('../controllers/chatController');
const authenticate = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multerMiddleware');

// Middleware de autenticación aplicado a todas las rutas
router.use(authenticate);

// Obtener historial de chat
router.get('/contrataciones/:id_contratacion/chat', getChat);

// Enviar mensaje
router.post('/contrataciones/:id_contratacion/chat', sendMessage);

// Subir archivo
router.post('/contrataciones/:id_contratacion/archivos', 
  upload.single('archivo'), 
  uploadFile
);

// Listar archivos
router.get('/contrataciones/:id_contratacion/archivos', getFiles);

// En chatRoutes.js
/**
 * @swagger
 * tags:
 *   - name: Chat
 *     description: Sistema de mensajería y archivos para contrataciones
 *   - name: Archivos
 *     description: Gestión de archivos compartidos en contrataciones
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Mensaje:
 *       type: object
 *       properties:
 *         id_mensaje:
 *           type: integer
 *         texto:
 *           type: string
 *         fecha_hora:
 *           type: string
 *           format: date-time
 *         id_usuario:
 *           type: integer
 *         nombre_remitente:
 *           type: string
 *         id_rol:
 *           type: integer
 *     Archivo:
 *       type: object
 *       properties:
 *         id_archivo:
 *           type: integer
 *         nombre_archivo:
 *           type: string
 *         tipo_archivo:
 *           type: string
 *         fecha_subida:
 *           type: string
 *           format: date-time
 *         subido_por:
 *           type: string
 *         url:
 *           type: string
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/contrataciones/{id_contratacion}/chat:
 *   get:
 *     summary: Obtener historial de chat de una contratación
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_contratacion
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la contratación
 *     responses:
 *       200:
 *         description: Listado de mensajes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Mensaje'
 *       403:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /api/contrataciones/{id_contratacion}/chat:
 *   post:
 *     summary: Enviar mensaje en una contratación
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_contratacion
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
 *       201:
 *         description: Mensaje enviado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 id_mensaje:
 *                   type: integer
 *       400:
 *         description: Mensaje vacío
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /api/contrataciones/{id_contratacion}/archivos:
 *   post:
 *     summary: Subir archivo a una contratación
 *     tags: [Archivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_contratacion
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               archivo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Archivo subido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Archivo'
 *       400:
 *         description: No se subió archivo o tipo no permitido
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error al subir archivo
 */

/**
 * @swagger
 * /api/contrataciones/{id_contratacion}/archivos:
 *   get:
 *     summary: Listar archivos de una contratación
 *     tags: [Archivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_contratacion
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Listado de archivos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_archivo:
 *                     type: integer
 *                   nombre_archivo:
 *                     type: string
 *                   tipo_archivo:
 *                     type: string
 *                   fecha_subida:
 *                     type: string
 *                     format: date-time
 *                   subido_por:
 *                     type: string
 *                   url:
 *                     type: string
 *                     description: URL para descargar el archivo
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Contratación no encontrada
 */

// En contratacionesRoutes.js
/**
 * @swagger
 * /api/contrataciones/{id}/completar:
 *   patch:
 *     summary: Marcar servicio como completado (solo entrenador)
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
 *         description: Servicio completado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error al completar servicio
 */

module.exports = router;