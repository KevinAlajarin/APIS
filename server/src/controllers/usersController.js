// server/src/controllers/usersController.js
const User = require('../models/User');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

const updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Solo admins o el propio usuario pueden actualizar
    if (req.user.id_rol !== 1 && req.user.id_usuario !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    await User.update(req.params.id, req.body);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.user.id_rol !== 1 && req.user.id_usuario !== parseInt(req.params.id)) {
        return res.status(403).json({ error: 'No autorizado' });
      }

    await User.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

const changePassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user.id_usuario);
  
      // Verificar que el usuario existe y tiene contraseña
      if (!user || !user.contraseña_hash) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      console.log('Comparando contraseñas...'); // Debug
      console.log('Contraseña recibida:', currentPassword); // Debug
      console.log('Hash en DB:', user.contraseña_hash); // Debug
  
      const match = await bcrypt.compare(currentPassword, user.contraseña_hash);
      if (!match) {
        return res.status(400).json({ error: 'Contraseña actual incorrecta' });
      }
  
      // Validar que la nueva contraseña sea diferente
      if (await bcrypt.compare(newPassword, user.contraseña_hash)) {
        return res.status(400).json({ error: 'La nueva contraseña debe ser diferente a la actual' });
      }
  
      const newHash = await bcrypt.hash(newPassword, saltRounds);
      await User.update(req.user.id_usuario, { contraseña_hash: newHash });
  
      res.json({ success: true });
    } catch (error) {
      console.error('Error en changePassword:', error);
      res.status(500).json({ 
        error: 'Error al cambiar contraseña',
        details: error.message 
      });
    }
  };

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword
};