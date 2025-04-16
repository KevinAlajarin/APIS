const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { check } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación de usuarios
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserRegister:
 *       type: object
 *       required:
 *         - id_rol
 *         - nombre
 *         - apellido
 *         - email
 *         - contraseña
 *         - fecha_nacimiento
 *       properties:
 *         id_rol:
 *           type: integer
 *           enum: [1, 2, 3]
 *           description: |
 *             1 = admin, 2 = cliente, 3 = entrenador
 *           example: 2
 *         nombre:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: "Juan"
 *         apellido:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: "Pérez"
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 255
 *           example: "juan@example.com"
 *         contraseña:
 *           type: string
 *           description: Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial
 *           example: "Pass123!"
 *         fecha_nacimiento:
 *           type: string
 *           format: date
 *           example: "1990-01-01"
 */

// Validaciones para registro
const registerValidations = [
  check('id_rol').isInt({ min: 1, max: 3 }).withMessage('Rol inválido'),
  check('nombre').isLength({ min: 2, max: 100 }).withMessage('Nombre debe tener entre 2 y 100 caracteres'),
  check('apellido').isLength({ min: 2, max: 100 }).withMessage('Apellido debe tener entre 2 y 100 caracteres'),
  check('email').isEmail().withMessage('Email inválido'),
  check('contraseña')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una mayúscula')
    .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número')
    .matches(/[!@#$%^&*]/).withMessage('La contraseña debe contener al menos un carácter especial'),
  check('fecha_nacimiento').isISO8601().withMessage('Fecha inválida (formato YYYY-MM-DD)')
];

/**
 * @swagger
 * /api/auth/registro:
 *   post:
 *     summary: Registro de nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       201:
 *         description: Usuario registrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                       param:
 *                         type: string
 *       500:
 *         description: Error interno del servidor
 */
router.post('/registro', registerValidations, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicio de sesión
 *     tags: [Auth]
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
 *                 example: "juan@example.com"
 *               contraseña:
 *                 type: string
 *                 example: "Pass123!"
 *     responses:
 *       200:
 *         description: Sesión iniciada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error interno del servidor
 */
router.post('/login', login);

module.exports = router;