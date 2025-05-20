// server/src/models/statsModel.js
const { getConnection, sql } = require('../config/db');

class Stats {
  static async getByTrainer(id_entrenador) {
    const pool = await getConnection();
    try {
      const result = await pool.request()
        .input('id_entrenador', sql.Int, id_entrenador)
        .query(`
          -- Visualizaciones totales
          SELECT 
            COUNT(vs.id_visualizacion) AS total_visualizaciones,
            
            -- Tasa de conversión (contrataciones/visualizaciones)
            CASE 
              WHEN COUNT(vs.id_visualizacion) = 0 THEN 0
              ELSE (COUNT(DISTINCT c.id_contratacion) * 100.0 / COUNT(vs.id_visualizacion))
            END AS tasa_conversion,
            
            -- Calificaciones
            AVG(CAST(r.puntuacion AS DECIMAL(3,1))) AS promedio_calificaciones,
            COUNT(r.id_resenia) AS total_calificaciones,
            
            -- Distribución de estrellas
            SUM(CASE WHEN r.puntuacion = 1 THEN 1 ELSE 0 END) AS estrellas_1,
            SUM(CASE WHEN r.puntuacion = 2 THEN 1 ELSE 0 END) AS estrellas_2,
            SUM(CASE WHEN r.puntuacion = 3 THEN 1 ELSE 0 END) AS estrellas_3,
            SUM(CASE WHEN r.puntuacion = 4 THEN 1 ELSE 0 END) AS estrellas_4,
            SUM(CASE WHEN r.puntuacion = 5 THEN 1 ELSE 0 END) AS estrellas_5
            
          FROM servicios s
          LEFT JOIN visualizaciones_servicios vs ON s.id_servicio = vs.id_servicio
          LEFT JOIN contrataciones c ON s.id_servicio = c.id_servicio AND c.estado = 'completado'
          LEFT JOIN resenias r ON c.id_contratacion = r.id_contratacion AND r.estado = 'aprobado'
          WHERE s.id_entrenador = @id_entrenador
            AND s.activo = 1
        `);

      return {
        ...result.recordset[0],
        distribucion_calificaciones: [
          result.recordset[0].estrellas_1,
          result.recordset[0].estrellas_2,
          result.recordset[0].estrellas_3,
          result.recordset[0].estrellas_4,
          result.recordset[0].estrellas_5
        ]
      };
    } catch (error) {
      console.error('Error en Stats.getByEntrenador:', error.message);
      throw error;
    }
  }

  static async getPopularServices(id_entrenador, limit = 3) {
    const pool = await getConnection();
    try {
      const result = await pool.request()
        .input('id_entrenador', sql.Int, id_entrenador)
        .input('limit', sql.Int, limit)
        .query(`
          SELECT TOP (@limit)
            s.id_servicio,
            s.descripcion,
            COUNT(c.id_contratacion) AS total_contrataciones,
            COUNT(vs.id_visualizacion) AS visualizaciones
          FROM servicios s
          LEFT JOIN contrataciones c ON s.id_servicio = c.id_servicio AND c.estado = 'completado'
          LEFT JOIN visualizaciones_servicios vs ON s.id_servicio = vs.id_servicio
          WHERE s.id_entrenador = @id_entrenador
            AND s.activo = 1
          GROUP BY s.id_servicio, s.descripcion
          ORDER BY total_contrataciones DESC, visualizaciones DESC
        `);

      return result.recordset;
    } catch (error) {
      console.error('Error en Stats.getServiciosPopulares:', error.message);
      throw error;
    }
  }
}

module.exports = Stats;