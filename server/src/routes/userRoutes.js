// server/src/routes/usersRoutes.js
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const usersController = require('../controllers/usersController');
const authenticate = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         roleId:
 *           type: integer
 *           example: 2
 *         firstName:
 *           type: string
 *           example: "John"
 *         lastName:
 *           type: string
 *           example: "Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         birthDate:
 *           type: string
 *           format: date
 *           example: "1990-01-01"
 *         registrationDate:
 *           type: string
 *           format: date-time
 *           example: "2023-08-15T10:30:00Z"
 *     
 *     PasswordChange:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           example: "OldPass123!"
 *         newPassword:
 *           type: string
 *           description: Minimum 8 chars, 1 uppercase, 1 number and 1 special char
 *           example: "NewPass456!"
 */


/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Fully update user (admin or own user)
 *     tags: [Users]
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
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         description: Validation error
 *       403:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (soft delete)
 *     tags: [Users]
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
 *         description: User deleted
 *       403:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */


/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PasswordChange'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Current password incorrect or validation error
 *       403:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */


// Validaciones
const updateValidations = [
  check('nombre').optional().isLength({ min: 2, max: 100 }),
  check('apellido').optional().isLength({ min: 2, max: 100 }),
  check('fecha_nacimiento').optional().isISO8601()
];

const passwordValidations = [
  check('currentPassword').notEmpty(),
  check('newPassword')
    .isLength({ min: 8 })
    .matches(/[A-Z]/)
    .matches(/[0-9]/)
    .matches(/[!@#$%^&*]/)
];

// Rutas públicas
router.get('/', usersController.getAllUsers);
router.get('/:id', usersController.getUserById);

// Rutas protegidas
router.use(authenticate);

router.put('/:id', updateValidations, usersController.updateUser);
router.delete('/:id', authenticate, usersController.deleteUser);
router.post('/change-password', passwordValidations, usersController.changePassword);

module.exports = router;