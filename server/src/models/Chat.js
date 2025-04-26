// server/src/models/Chat.js
const { getConnection, sql } = require('../config/db');

class Chat {
  static async getMessages(id_contratacion, userId) {
    const pool = await getConnection();
    try {
      const result = await pool.request()
        .input('id_contratacion', sql.Int, id_contratacion)
        .input('userId', sql.Int, userId)
        .query(`
          SELECT 
            m.id_mensaje,
            m.texto,
            m.fecha_hora,
            u.id_usuario,
            CONCAT(u.nombre, ' ', u.apellido) AS nombre_remitente,
            u.id_rol
          FROM mensajes m
          JOIN usuarios u ON m.id_remitente = u.id_usuario
          WHERE m.id_contratacion = @id_contratacion
            AND EXISTS (
              SELECT 1 FROM contrataciones c
              JOIN servicios s ON c.id_servicio = s.id_servicio
              WHERE c.id_contratacion = @id_contratacion
                AND (c.id_cliente = @userId OR s.id_entrenador = @userId)
            )
          ORDER BY m.fecha_hora ASC
        `);
      return result.recordset;
    } catch (error) {
      throw new Error(`Error al obtener mensajes: ${error.message}`);
    }
  }

  static async sendMessage(id_contratacion, id_remitente, texto) {
    const pool = await getConnection();
    try {
      const result = await pool.request()
        .input('id_contratacion', sql.Int, id_contratacion)
        .input('id_remitente', sql.Int, id_remitente)
        .input('texto', sql.Text, texto)
        .query(`
          DECLARE @InsertedRows TABLE (id_mensaje INT);
          
          INSERT INTO mensajes (id_contratacion, id_remitente, texto)
          OUTPUT INSERTED.id_mensaje INTO @InsertedRows
          VALUES (@id_contratacion, @id_remitente, @texto);
          
          SELECT id_mensaje FROM @InsertedRows;
        `);
      
      return result.recordset[0].id_mensaje;
    } catch (error) {
      if (error.number === 51000) { // Error del trigger
        throw new Error('No autorizado: ' + error.message);
      }
      throw new Error(`Error al enviar mensaje: ${error.message}`);
    }
  }
}

module.exports = Chat;