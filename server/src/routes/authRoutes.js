const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  solicitarRecuperacionContrasena, 
  resetearContrasena 
} = require('../controllers/authController');

const { check } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication 
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
 *         - repetir_contraseña
 *         - fecha_nacimiento
 *       properties:
 *         id_rol:
 *           type: integer
 *           enum: [1, 2, 3]
 *           description: |
 *             1 = admin, 2 = client, 3 = trainer
 *           example: 2
 *         nombre:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: "John"
 *         apellido:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: "Doe"
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 255
 *           example: "john@example.com"
 *         contraseña:
 *           type: string
 *           description: Minimum 8 chars, 1 uppercase, 1 number and 1 special char
 *           example: "Pass123!"
 *         repetir_contraseña:
 *           type: string
 *           description: Should match contraseña field
 *           example: "Pass123!"
 *         fecha_nacimiento:
 *           type: string
 *           format: date
 *           example: "1990-01-01"
 * 
 *     PasswordResetRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 * 
 *     PasswordReset:
 *       type: object
 *       required:
 *         - token
 *         - nuevaContrasena
 *         - repetirNuevaContrasena
 *       properties:
 *         token:
 *           type: string
 *           example: "a1b2c3d4e5f6..."
 *         nuevaContrasena:
 *           type: string
 *           description: Minimum 8 chars, 1 uppercase, 1 number and 1 special char
 *           example: "NuevaPass123!"
 *         repetirNuevaContrasena:
 *           type: string
 *           description: Debe coincidir con nuevaContrasena
 *           example: "NuevaPass123!"
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
  check('repetir_contraseña')
    .notEmpty().withMessage('Debe confirmar la contraseña')
    .custom((value, { req }) => {
      if (value !== req.body.contraseña) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
  check('fecha_nacimiento').isISO8601().withMessage('Fecha inválida (formato YYYY-MM-DD)')
];

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 id_usuario:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already registered
 *       500:
 *         description: Internal server error
 */
router.post('/register', registerValidations, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user
 *     tags: [Authentication]
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
 *                 example: "john@example.com"
 *               contraseña:
 *                 type: string
 *                 example: "Pass123!"
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 id_usuario:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Missing credentials
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post('/login', login);

/**
 * @swagger
 * components:
 *   schemas:
 *     PasswordResetRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "usuario@example.com"
 * 
 *     PasswordReset:
 *       type: object
 *       required:
 *         - token
 *         - nuevaContrasena
 *         - repetirNuevaContrasena
 *       properties:
 *         token:
 *           type: string
 *           example: "a1b2c3d4e5f6..."
 *         nuevaContrasena:
 *           type: string
 *           description: Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial
 *           example: "NuevaPass123!"
 *         repetirNuevaContrasena:
 *           type: string
 *           description: Should match nuevaContrasena
 *           example: "NuevaPass123!"
 */

// Validaciones para recuperación de contraseña
const passwordResetValidations = [
  check('email').isEmail().withMessage('Email inválido').normalizeEmail()
];

const newPasswordValidations = [
  check('token').notEmpty().withMessage('Token requerido'),
  check('nuevaContrasena')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una mayúscula')
    .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número')
    .matches(/[!@#$%^&*]/).withMessage('La contraseña debe contener al menos un carácter especial'),
  check('repetirNuevaContrasena')
    .notEmpty().withMessage('Debe confirmar la nueva contraseña')
    .custom((value, { req }) => {
      if (value !== req.body.nuevaContrasena) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
];

/**
 * @swagger
 * /api/auth/password-reset:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PasswordResetRequest'
 *     responses:
 *       200:
 *         description: If email exists, reset instructions will be sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset email sent"
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */

router.post('/password-reset', passwordResetValidations, solicitarRecuperacionContrasena);

/**
 * @swagger
 * /api/auth/password-reset/confirm:
 *   post:
 *     summary: Confirm password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PasswordReset'
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password updated successfully"
 *       400:
 *         description: Invalid token or validation error
 *       500:
 *         description: Internal server error
 */
router.post('/password-reset/confirm', newPasswordValidations, resetearContrasena);

module.exports = router;