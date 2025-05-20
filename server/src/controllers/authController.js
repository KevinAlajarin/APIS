// /server/src/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const crypto = require('crypto');
const { getConnection, sql } = require('../config/db'); 
const { sendPasswordResetEmail } = require('../utils/emailService');


const register = async (req, res) => {
  try {
    const { id_rol, nombre, apellido, email, contraseña, repetir_contraseña, fecha_nacimiento } = req.body;

    // Validaciones básicas
    if (!id_rol || !nombre || !email || !contraseña || !repetir_contraseña) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Validar que las contraseñas coincidan
    if (contraseña !== repetir_contraseña) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden' });
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
      { 
        id_usuario: id_usuario,
        id_rol: id_rol,
        email: email 
      },
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
      { 
        id_usuario: user.id_usuario,
        email: user.email,
        id_rol: user.id_rol 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, id_usuario: user.id_usuario });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

const solicitarRecuperacionContrasena = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(200).json({ message: 'Si el email existe, se enviarán instrucciones' });
    }

    // Generar token y expiración
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpira = new Date(Date.now() + 3600000); // 1 hora

    // Obtener conexión
    const pool = await getConnection();
    const request = pool.request(); // Usar la conexión obtenida
    
    // Configurar parámetros
    request.input('email', sql.VarChar(255), email);
    request.input('resetToken', sql.VarChar(255), resetToken);
    request.input('resetTokenExpira', sql.DateTime2, resetTokenExpira);

    await request.query(`
      UPDATE usuarios
      SET 
        reset_token = @resetToken,
        reset_token_expira = @resetTokenExpira
      WHERE email_normalizado = LOWER(TRIM(@email))
    `);

    // Enviar email
    await sendPasswordResetEmail(email, resetToken);

    res.json({ message: 'Correo de recuperación enviado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};

const resetearContrasena = async (req, res) => {
  try {
    const { token, nuevaContrasena, repetirNuevaContrasena } = req.body;

    // Validar que las contraseñas coincidan
    if (nuevaContrasena !== repetirNuevaContrasena) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }

    // Validar contraseña
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(nuevaContrasena)) {
      return res.status(400).json({ error: 'La contraseña no cumple los requisitos' });
    }

    // Obtener conexión
    const pool = await getConnection();
    const request = pool.request(); // Usar la conexión obtenida
    
    // Buscar usuario por token
    request.input('token', sql.VarChar(255), token);

    const result = await request.query(`
      SELECT * FROM usuarios
      WHERE reset_token = @token
      AND reset_token_expira > GETDATE()
    `);

    const user = result.recordset[0];

    if (!user) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    // Actualizar contraseña y limpiar token
    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);
    
    const updateRequest = pool.request(); // Usar la misma conexión
    updateRequest.input('id', sql.Int, user.id_usuario);
    updateRequest.input('password', sql.VarChar(255), hashedPassword);

    await updateRequest.query(`
      UPDATE usuarios
      SET 
        contraseña_hash = @password,
        reset_token = NULL,
        reset_token_expira = NULL
      WHERE id_usuario = @id
    `);

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al restablecer contraseña' });
  }
};

module.exports = { register, login, solicitarRecuperacionContrasena, resetearContrasena};