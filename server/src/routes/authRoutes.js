const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints para registro y login de usuarios
 */

/**
 * @swagger
 * /api/auth/registro:
 *   post:
 *     summary: Registra un nuevo usuario en el sistema
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_rol
 *               - nombre
 *               - apellido
 *               - email
 *               - contraseña
 *               - fecha_nacimiento
 *             properties:
 *               id_rol:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *                 description: |
 *                   ID del rol del usuario:
 *                   - 1 = admin
 *                   - 2 = cliente
 *                   - 3 = entrenador
 *                 example: 2
 *               nombre:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "Juan"
 *               apellido:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "Pérez"
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 255
 *                 example: "juan.perez@example.com"
 *               contraseña:
 *                 type: string
 *                 description: |
 *                   Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial
 *                 example: "Pass123!"
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *                 description: Formato YYYY-MM-DD
 *                 example: "1990-01-15"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token para autenticación
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: |
 *           Error de validación. Posibles causas:
 *           - Email ya registrado
 *           - Contraseña no cumple requisitos
 *           - Faltan campos obligatorios
 *       500:
 *         description: Error interno del servidor
 */
router.post('/registro', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Autentica un usuario existente
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - contraseña
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan.perez@example.com"
 *               contraseña:
 *                 type: string
 *                 example: "Pass123!"
 *     responses:
 *       200:
 *         description: Autenticación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token para autenticación
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error interno del servidor
 */
router.post('/login', login);

module.exports = router;