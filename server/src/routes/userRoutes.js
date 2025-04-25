// server/src/routes/usersRoutes.js
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const usersController = require('../controllers/usersController');
const authenticate = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id_usuario:
 *           type: integer
 *           example: 1
 *         id_rol:
 *           type: integer
 *           example: 2
 *         nombre:
 *           type: string
 *           example: "Juan"
 *         apellido:
 *           type: string
 *           example: "Pérez"
 *         email:
 *           type: string
 *           format: email
 *           example: "juan@example.com"
 *         fecha_nacimiento:
 *           type: string
 *           format: date
 *           example: "1990-01-01"
 *         fecha_registro:
 *           type: string
 *           format: date-time
 *           example: "2023-08-15T10:30:00Z"
 */

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Gestión de usuarios
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 */

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar usuario (propio o por admin)
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Nuevo nombre"
 *               apellido:
 *                 type: string
 *                 example: "Nuevo apellido"
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       403:
 *         description: No autorizado
 */

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar usuario
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
 *         description: Usuario eliminado (soft delete)
 *       403:
 *         description: No autorizado
 */

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Cambiar contraseña
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "Pass123!"
 *               newPassword:
 *                 type: string
 *                 example: "NewPass456!"
 *     responses:
 *       200:
 *         description: Contraseña cambiada
 *       400:
 *         description: Contraseña actual incorrecta
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