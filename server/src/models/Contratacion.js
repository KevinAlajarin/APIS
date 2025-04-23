// server/src/models/Contratacion.js
const { getConnection, sql } = require('../config/db');

class Contratacion {
// Versión final optimizada para tu contexto
static async create(id_cliente, id_servicio) {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);
    
    try {
      await transaction.begin();
      const request = new sql.Request(transaction);
  
      // 1. Verificar disponibilidad del servicio
      const servicio = await request.query(`
        SELECT id_servicio, id_entrenador, activo
        FROM servicios 
        WHERE id_servicio = ${id_servicio}
          AND activo = 1
          AND NOT EXISTS (
            SELECT 1 FROM contrataciones
            WHERE id_servicio = ${id_servicio}
            AND estado IN ('pendiente', 'aceptado')
          )
      `);
  
      if (!servicio.recordset[0]) {
        throw new Error('El servicio no está disponible para contratación');
      }
  
      // 2. Bloquear servicio
      await request.query(`
        UPDATE servicios
        SET activo = 0
        WHERE id_servicio = ${id_servicio}
      `);
  
      // 3. Crear contratación
      await request.query(`
        INSERT INTO contrataciones (id_cliente, id_servicio, estado)
        VALUES (${id_cliente}, ${id_servicio}, 'pendiente')
      `);
  
      // 4. Obtener contratación creada
      const result = await request.query(`
        SELECT TOP 1 *
        FROM contrataciones
        WHERE id_servicio = ${id_servicio}
        ORDER BY id_contratacion DESC
      `);
  
      await transaction.commit();
      return result.recordset[0];
  
    } catch (error) {
      await transaction.rollback();
      console.error('Error en Contratacion.create:', error.message);
      throw error;
    }
  }

  static async getByUser(id_usuario) {
    const pool = await getConnection();
    try {
      const result = await pool.request()
        .input('id_usuario', sql.Int, id_usuario)
        .query(`
          SELECT 
            c.id_contratacion,
            c.estado,
            c.fecha_solicitud,
            c.fecha_aceptacion,
            c.fecha_completado,
            s.id_servicio,
            s.descripcion AS servicio_descripcion,
            s.precio,
            s.duracion,
            u.nombre + ' ' + u.apellido AS entrenador_nombre,
            cat.nombre AS categoria
          FROM contrataciones c
          JOIN servicios s ON c.id_servicio = s.id_servicio
          JOIN usuarios u ON s.id_entrenador = u.id_usuario
          JOIN categorias cat ON s.id_categoria = cat.id_categoria
          WHERE c.id_cliente = @id_usuario
          ORDER BY c.fecha_solicitud DESC
        `);

      return result.recordset;
    } catch (error) {
      console.error('Error en Contratacion.getByUser:', error.message);
      throw error;
    }
  }

  static async getById(id_contratacion) {
    const pool = await getConnection();
    try {
      const result = await pool.request()
        .input('id_contratacion', sql.Int, id_contratacion)
        .query(`
          SELECT 
            c.*,
            s.id_entrenador  -- <- Agregamos esta columna
          FROM contrataciones c
          JOIN servicios s ON c.id_servicio = s.id_servicio
          WHERE c.id_contratacion = @id_contratacion
        `);
  
      return result.recordset[0];
    } catch (error) {
      console.error('Error en Contratacion.getById:', error.message);
      throw error;
    }
  }

  static async updateEstado(id_contratacion, nuevoEstado, id_usuario) {
    const pool = await getConnection();
    try {
      // Verificar permisos (solo cliente o entrenador relacionado)
      const contratacion = await this.getById(id_contratacion);
      const servicio = await pool.request()
        .input('id_servicio', sql.Int, contratacion.id_servicio)
        .query('SELECT id_entrenador FROM servicios WHERE id_servicio = @id_servicio');

      const esCliente = contratacion.id_cliente === id_usuario;
      const esEntrenador = servicio.recordset[0].id_entrenador === id_usuario;

      if (!esCliente && !esEntrenador) {
        throw new Error('No tienes permisos para esta acción');
      }

      // Validar transiciones de estado
      const estadosValidos = {
        pendiente: ['aceptado', 'cancelado'],
        aceptado: ['completado', 'cancelado'],
        cancelado: [],
        completado: []
      };

      if (!estadosValidos[contratacion.estado].includes(nuevoEstado)) {
        throw new Error(`Transición de estado no permitida: ${contratacion.estado} -> ${nuevoEstado}`);
      }

      // Actualizar estado
      await pool.request()
        .input('id_contratacion', sql.Int, id_contratacion)
        .input('nuevoEstado', sql.VarChar(20), nuevoEstado)
        .query(`
          UPDATE contrataciones
          SET estado = @nuevoEstado
          WHERE id_contratacion = @id_contratacion
        `);

      return true;
    } catch (error) {
      console.error('Error en Contratacion.updateEstado:', error.message);
      throw error;
    }
  }
}

module.exports = Contratacion;