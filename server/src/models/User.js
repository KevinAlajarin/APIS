const { getConnection, sql } = require('../config/db');

class User {
  static async create({ id_rol, nombre, apellido, email, contraseña_hash, fecha_nacimiento }) {
    const pool = await getConnection();
    try {
      const request = pool.request();
      request.input('id_rol', sql.Int, id_rol);
      request.input('nombre', sql.VarChar(100), nombre);
      request.input('apellido', sql.VarChar(100), apellido);
      request.input('email', sql.VarChar(255), email);
      request.input('contraseña_hash', sql.VarChar(255), contraseña_hash);
      request.input('fecha_nacimiento', sql.Date, fecha_nacimiento);

      const result = await request.query(`
        INSERT INTO usuarios (id_rol, nombre, apellido, email, contraseña_hash, fecha_nacimiento)
        OUTPUT INSERTED.id_usuario
        VALUES (@id_rol, @nombre, @apellido, @email, @contraseña_hash, @fecha_nacimiento)
      `);

      return result.recordset[0].id_usuario;
    } catch (error) {
      console.error('Error en User.create:', error.message);
      if (error.number === 2627) { // Violación de unique key (email duplicado)
        throw new Error('El email ya está registrado');
      }
      throw error;
    }
  }

  static async findByEmail(email) {
    const pool = await getConnection();
    try {
      const request = pool.request();
      request.input('email', sql.VarChar(255), email);

      const result = await request.query(`
        SELECT 
          id_usuario, 
          id_rol, 
          nombre, 
          apellido, 
          email, 
          contraseña_hash,
          fecha_nacimiento
        FROM usuarios 
        WHERE email_normalizado = LOWER(TRIM(@email)) 
        AND eliminado = 0
      `);

      return result.recordset[0];
    } catch (error) {
      console.error('Error en User.findByEmail:', error.message);
      throw error;
    }
  }

  static async findById(id_usuario) {
    const pool = await getConnection();
    try {
      const request = pool.request();
      request.input('id_usuario', sql.Int, id_usuario);

      const result = await request.query(`
        SELECT 
          id_usuario,
          id_rol,
          nombre,
          apellido,
          email,
          contraseña_hash,
          fecha_nacimiento
        FROM usuarios
        WHERE id_usuario = @id_usuario
        AND eliminado = 0
      `);

      return result.recordset[0];
    } catch (error) {
      console.error('Error en User.findById:', error.message);
      throw error;
    }
  }

  static async updateProfile(id_usuario, { nombre, apellido, fecha_nacimiento }) {
    const pool = await getConnection();
    try {
      const request = pool.request();
      request.input('id_usuario', sql.Int, id_usuario);
      request.input('nombre', sql.VarChar(100), nombre);
      request.input('apellido', sql.VarChar(100), apellido);
      request.input('fecha_nacimiento', sql.Date, fecha_nacimiento);

      await request.query(`
        UPDATE usuarios
        SET 
          nombre = @nombre,
          apellido = @apellido,
          fecha_nacimiento = @fecha_nacimiento,
          fecha_ultima_actualizacion = GETDATE()
        WHERE id_usuario = @id_usuario
      `);

      return true;
    } catch (error) {
      console.error('Error en User.updateProfile:', error.message);
      throw error;
    }
  }

  static async getAll() {
    const pool = await getConnection();
    try {
      const result = await pool.request().query(`
        SELECT 
          id_usuario,
          id_rol,
          nombre,
          apellido,
          email,
          fecha_nacimiento
        FROM usuarios
        WHERE eliminado = 0
      `);
      return result.recordset;
    } catch (error) {
      console.error('Error en User.getAll:', error.message);
      throw error;
    }
  }
  
  static async update(id_usuario, updateData) {
    const pool = await getConnection();
    try {
      const request = pool.request();
      request.input('id_usuario', sql.Int, id_usuario);
  
      let updateFields = [];
      for (const [key, value] of Object.entries(updateData)) {
        request.input(key, determineSqlType(key), value);
        updateFields.push(`${key} = @${key}`);
      }
  
      await request.query(`
        UPDATE usuarios
        SET 
          ${updateFields.join(', ')},
          fecha_ultima_actualizacion = GETDATE()
        WHERE id_usuario = @id_usuario
      `);
  
      return true;
    } catch (error) {
      console.error('Error en User.update:', error.message);
      throw error;
    }
  }
  
  static async delete(id_usuario) {
    const pool = await getConnection();
    try {
      const request = pool.request();
      request.input('id_usuario', sql.Int, id_usuario);
  
      await request.query(`
        UPDATE usuarios
        SET 
          eliminado = 1,
          fecha_eliminacion = GETDATE()
        WHERE id_usuario = @id_usuario
      `);
  
      return true;
    } catch (error) {
      console.error('Error en User.delete:', error.message);
      throw error;
    }
  }
} 

// Helper para tipos SQL 
function determineSqlType(key) {
  const typeMap = {
    id_rol: sql.Int,
    fecha_nacimiento: sql.Date,
  };
  return typeMap[key] || sql.VarChar(sql.MAX);
}



module.exports = User;