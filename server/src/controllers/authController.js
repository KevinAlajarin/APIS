// /server/src/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const register = async (req, res) => {
  try {
    const { id_rol, nombre, apellido, email, contraseña, fecha_nacimiento } = req.body;

    // Validaciones básicas
    if (!id_rol || !nombre || !email || !contraseña) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Validar contraseña
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(contraseña)) {
      return res.status(400).json({ 
        error: 'La contraseña necesita 8+ caracteres, 1 mayúscula, 1 número y 1 carácter especial'
      });
    }

    // Hash de contraseña
    const contraseña_hash = await bcrypt.hash(contraseña, saltRounds);

    const id_usuario = await User.create({
      id_rol,
      nombre,
      apellido,
      email,
      contraseña_hash,
      fecha_nacimiento
    });

    const token = jwt.sign(
      { id_usuario, email, id_rol },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ token, id_usuario });
  } catch (error) {
    console.error('Error en registro:', error);
    
    if (error.message.includes('duplicate key')) {
      return res.status(409).json({ error: 'Email ya registrado' });
    }
    
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

const login = async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const match = await bcrypt.compare(contraseña, user.contraseña_hash);
    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id_usuario: user.id_usuario, email, id_rol: user.id_rol },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, id_usuario: user.id_usuario });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

module.exports = { register, login };