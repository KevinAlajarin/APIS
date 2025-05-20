// server/src/models/Resenia.js
const { getConnection, sql } = require('../config/db');

class Resenia {
  static async createReview(id_contratacion, id_cliente, puntuacion, comentario) {
    const pool = await getConnection();
    try {
      // Verificar que la contratación existe y está completada
      const contratacion = await pool.request()
        .input('id_contratacion', sql.Int, id_contratacion)
        .query(`
          SELECT id_cliente, estado, id_servicio 
          FROM contrataciones 
          WHERE id_contratacion = @id_contratacion
        `);

      if (!contratacion.recordset[0]) {
        throw new Error('Contratación no encontrada');
      }

      if (contratacion.recordset[0].estado !== 'completado') {
        throw new Error('Solo puedes reseñar servicios completados');
      }

      if (contratacion.recordset[0].id_cliente !== id_cliente) {
        throw new Error('No tienes permisos para reseñar esta contratación');
      }

      // Verificar que no existe reseña previa
      const existeResenia = await pool.request()
        .input('id_contratacion', sql.Int, id_contratacion)
        .query('SELECT 1 FROM resenias WHERE id_contratacion = @id_contratacion');

      if (existeResenia.recordset.length > 0) {
        throw new Error('Ya has reseñado este servicio');
      }

      // Crear reseña
      const result = await pool.request()
        .input('id_contratacion', sql.Int, id_contratacion)
        .input('puntuacion', sql.Int, puntuacion)
        .input('comentario', sql.Text, comentario)
        .query(`
          INSERT INTO resenias (id_contratacion, puntuacion, comentario, estado)
          OUTPUT INSERTED.id_resenia
          VALUES (@id_contratacion, @puntuacion, @comentario, 'pendiente')
        `);

      return result.recordset[0].id_resenia;
    } catch (error) {
      console.error('Error en Resenia.create:', error.message);
      throw error;
    }
  }

  static async getTrainerReviews(id_entrenador) {
    const pool = await getConnection();
    try {
      const result = await pool.request()
        .input('id_entrenador', sql.Int, id_entrenador)
        .query(`
          SELECT 
            r.id_resenia,
            r.puntuacion,
            r.comentario,
            r.estado,
            r.fecha_creacion,
            u.nombre + ' ' + u.apellido AS cliente_nombre,
            c.id_contratacion,
            s.descripcion AS servicio_descripcion,
            r.respuesta,
            r.fecha_respuesta,
            er.nombre + ' ' + er.apellido AS entrenador_respuesta_nombre
          FROM resenias r
          JOIN contrataciones c ON r.id_contratacion = c.id_contratacion
          JOIN servicios s ON c.id_servicio = s.id_servicio
          JOIN usuarios u ON c.id_cliente = u.id_usuario
          LEFT JOIN usuarios er ON r.id_entrenador_respuesta = er.id_usuario
          WHERE s.id_entrenador = @id_entrenador
          ORDER BY r.fecha_creacion DESC
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error en Resenia.getByEntrenador:', error.message);
      throw error;
    }
  }

  static async getClientReviews(id_cliente) {
    const pool = await getConnection();
    try {
      const result = await pool.request()
        .input('id_cliente', sql.Int, id_cliente)
        .query(`
          SELECT 
            r.id_resenia,
            r.puntuacion,
            r.comentario,
            r.estado,
            r.fecha_creacion,
            s.descripcion AS servicio_descripcion,
            e.nombre + ' ' + e.apellido AS entrenador_nombre,
            r.respuesta,
            r.fecha_respuesta,
            er.nombre + ' ' + er.apellido AS entrenador_respuesta_nombre
          FROM resenias r
          JOIN contrataciones c ON r.id_contratacion = c.id_contratacion
          JOIN servicios s ON c.id_servicio = s.id_servicio
          JOIN usuarios e ON s.id_entrenador = e.id_usuario
          LEFT JOIN usuarios er ON r.id_entrenador_respuesta = er.id_usuario
          WHERE c.id_cliente = @id_cliente
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error en Resenia.getByCliente:', error.message);
      throw error;
    }
  }
  
  // Nuevo método para eliminar reseñas
  static async deleteReview(id_resenia, id_usuario, esAdmin = false) {
    const pool = await getConnection();
    try {
      // Verificar permisos
      const resenia = await pool.request()
        .input('id_resenia', sql.Int, id_resenia)
        .query(`
          SELECT c.id_cliente, s.id_entrenador 
          FROM resenias r
          JOIN contrataciones c ON r.id_contratacion = c.id_contratacion
          JOIN servicios s ON c.id_servicio = s.id_servicio
          WHERE r.id_resenia = @id_resenia
        `);
  
      const puedeEliminar = esAdmin || 
                          resenia.recordset[0].id_cliente === id_usuario || 
                          resenia.recordset[0].id_entrenador === id_usuario;
  
      if (!puedeEliminar) throw new Error('No autorizado');
  
      await pool.request()
        .input('id_resenia', sql.Int, id_resenia)
        .query('DELETE FROM resenias WHERE id_resenia = @id_resenia');
  
      return true;
    } catch (error) {
      console.error('Error en Resenia.delete:', error.message);
      throw error;
    }
  }

  static async addReviewResponse(id_resenia, id_entrenador, texto) {
    const pool = await getConnection();
    try {
      // Verificación mejorada
      const reseniaValida = await pool.request()
        .input('id_resenia', sql.Int, id_resenia)
        .input('id_entrenador', sql.Int, id_entrenador)
        .query(`
          SELECT 1 FROM resenias r
          JOIN contrataciones c ON r.id_contratacion = c.id_contratacion
          JOIN servicios s ON c.id_servicio = s.id_servicio
          WHERE r.id_resenia = @id_resenia
          AND s.id_entrenador = @id_entrenador
          AND r.respuesta IS NULL  -- Solo si no tiene respuesta previa
        `);
  
      if (!reseniaValida.recordset[0]) {
        throw new Error('No tienes permisos para responder esta reseña o ya tiene respuesta');
      }
  
      // Actualizar respuesta
      await pool.request()
        .input('id_resenia', sql.Int, id_resenia)
        .input('texto', sql.Text, texto)
        .input('id_entrenador', sql.Int, id_entrenador)
        .query(`
          UPDATE resenias
          SET 
            respuesta = @texto,
            fecha_respuesta = GETDATE(),
            id_entrenador_respuesta = @id_entrenador
          WHERE id_resenia = @id_resenia
        `);
  
      return true;
    } catch (error) {
      console.error('Error en Resenia.addRespuesta:', error.message);
      throw error;
    }
  }
}

module.exports = Resenia;