const { getConnection, sql } = require('../config/db');

class Service {
  static async create({
    id_entrenador,
    id_categoria,
    id_zona,
    descripcion,
    precio,
    duracion,
    fecha_hora_inicio,
    fecha_hora_fin,
    idioma,
    modalidad
  }) {
    const pool = await getConnection();
    try {
      const request = pool.request();
      request.input('id_entrenador', sql.Int, id_entrenador);
      request.input('id_categoria', sql.Int, id_categoria);
      request.input('id_zona', sql.Int, id_zona);
      request.input('descripcion', sql.Text, descripcion);
      request.input('precio', sql.Decimal(10, 2), precio);
      request.input('duracion', sql.Int, duracion);
      request.input('fecha_hora_inicio', sql.DateTime2, fecha_hora_inicio);
      request.input('fecha_hora_fin', sql.DateTime2, fecha_hora_fin);
      request.input('idioma', sql.VarChar(20), idioma);
      request.input('modalidad', sql.VarChar(20), modalidad);

      const result = await request.query(`
        INSERT INTO servicios (
          id_entrenador, id_categoria, id_zona, descripcion, 
          precio, duracion, fecha_hora_inicio, fecha_hora_fin, 
          idioma, modalidad
        )
        OUTPUT INSERTED.id_servicio
        VALUES (
          @id_entrenador, @id_categoria, @id_zona, @descripcion,
          @precio, @duracion, @fecha_hora_inicio, @fecha_hora_fin,
          @idioma, @modalidad
        )
      `);

      return result.recordset[0].id_servicio;
    } catch (error) {
      console.error('Error en Service.create:', error.message);
      if (error.number === 547) { // Violación de FK
        throw new Error('Datos inválidos (categoría, zona o entrenador no existen)');
      }
      throw error;
    }
  }

  static async update(id_servicio, updateData) {
    const pool = await getConnection();
    try {
      const request = pool.request();
      request.input('id_servicio', sql.Int, id_servicio);

      let updateFields = [];
      for (const [key, value] of Object.entries(updateData)) {
        request.input(key, determineSqlType(key), value);
        updateFields.push(`${key} = @${key}`);
      }

      const query = `
        UPDATE servicios
        SET ${updateFields.join(', ')}
        WHERE id_servicio = @id_servicio
      `;

      await request.query(query);
      return true;
    } catch (error) {
      console.error('Error en Service.update:', error.message);
      throw error;
    }
  }

  static async getById(id_servicio) {
    const pool = await getConnection();
    try {
      const request = pool.request();
      request.input('id_servicio', sql.Int, id_servicio);

      const result = await request.query(`
        SELECT 
          s.*,
          c.nombre AS categoria,
          z.nombre AS zona,
          u.nombre + ' ' + u.apellido AS entrenador
        FROM servicios s
        JOIN categorias c ON s.id_categoria = c.id_categoria
        JOIN zonas z ON s.id_zona = z.id_zona
        JOIN usuarios u ON s.id_entrenador = u.id_usuario
        WHERE s.id_servicio = @id_servicio
      `);

      return result.recordset[0];
    } catch (error) {
      console.error('Error en Service.getById:', error.message);
      throw error;
    }
  }

  static async delete(id_servicio) {
    const pool = await getConnection();
    try {
      const request = pool.request();
      request.input('id_servicio', sql.Int, id_servicio);

      await request.query(`
        DELETE FROM servicios
        WHERE id_servicio = @id_servicio
      `);

      return true;
    } catch (error) {
      console.error('Error en Service.delete:', error.message);
      
      // Manejo especial para error de FK (si hay contrataciones relacionadas)
      if (error.number === 547) {
        throw new Error('No se puede eliminar el servicio porque tiene contrataciones asociadas');
      }
      
      throw error;
    }
  }

  static async search(filters) {
    const pool = await getConnection();
    try {
      const request = pool.request();
      let whereClauses = [
        's.activo = 1',
        `NOT EXISTS (
            SELECT 1 FROM contrataciones c
            WHERE c.id_servicio = s.id_servicio
            AND c.estado IN ('pendiente','aceptado')
            )`
      ]; 
      let joinClauses = [];

      // Construcción dinámica de la query
      if (filters.categoria) {
        request.input('categoria', sql.VarChar(50), `%${filters.categoria}%`);
        whereClauses.push('c.nombre LIKE @categoria');
        joinClauses.push('JOIN categorias c ON s.id_categoria = c.id_categoria');
      }

      if (filters.zona) {
        request.input('zona', sql.VarChar(50), `%${filters.zona}%`);
        whereClauses.push('z.nombre LIKE @zona');
        joinClauses.push('JOIN zonas z ON s.id_zona = z.id_zona');
      }

      if (filters.precioMax) {
        request.input('precioMax', sql.Decimal(10, 2), filters.precioMax);
        whereClauses.push('s.precio <= @precioMax');
      }

      const query = `
        SELECT 
          s.id_servicio,
          s.descripcion,
          s.precio,
          s.duracion,
          s.modalidad,
          s.idioma,
          c.nombre AS categoria,
          z.nombre AS zona,
          u.nombre + ' ' + u.apellido AS entrenador
        FROM servicios s
        ${joinClauses.join(' ')}
        JOIN usuarios u ON s.id_entrenador = u.id_usuario
        WHERE ${whereClauses.join(' AND ')}
        ORDER BY s.fecha_creacion DESC
      `;

      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      console.error('Error en Service.search:', error.message);
      throw error;
    }
  }

  static async updateServiceStatus(id_servicio, activo) {
    const pool = await getConnection();
    try {
      await pool.request()
        .input('id_servicio', sql.Int, id_servicio)
        .input('activo', sql.Bit, activo)
        .query(`
          UPDATE servicios
          SET activo = @activo
          WHERE id_servicio = @id_servicio
        `);
    } catch (error) {
      console.error('Error al actualizar estado del servicio:', error.message);
      throw error;
    }
  }
}

// Función helper para determinar tipos SQL
function determineSqlType(key) {
  const typeMap = {
    precio: sql.Decimal(10, 2),
    duracion: sql.Int,
    fecha_hora_inicio: sql.DateTime2,
    fecha_hora_fin: sql.DateTime2,
    activo: sql.Bit,
  };
  return typeMap[key] || sql.VarChar(sql.MAX);
}

module.exports = Service;