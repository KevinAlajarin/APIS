// server/src/models/File.js
const { getConnection, sql } = require('../config/db');
const path = require('path');
const fs = require('fs');

class File {
  static async uploadFile(id_contratacion, userId, file) {
    const pool = await getConnection();
    try {
      // Validar permisos y estado de contratación
      const valid = await pool.request()
        .input('id_contratacion', sql.Int, id_contratacion)
        .input('userId', sql.Int, userId)
        .query(`
          SELECT 1 
          FROM contrataciones c
          JOIN servicios s ON c.id_servicio = s.id_servicio
          WHERE c.id_contratacion = @id_contratacion
            AND (c.id_cliente = @userId OR s.id_entrenador = @userId)
            AND c.estado IN ('aceptado', 'pendiente')
        `);

      if (!valid.recordset[0]) {
        throw new Error('No tienes permisos para subir archivos a esta contratación');
      }

      // Configurar almacenamiento
      const uploadDir = path.join(__dirname, '../../uploads', id_contratacion.toString());
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filename = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadDir, filename);
      
      // Guardar archivo
      fs.writeFileSync(filePath, file.buffer);

      // Registrar en BD
      await pool.request()
        .input('id_contratacion', sql.Int, id_contratacion)
        .input('id_usuario_subio', sql.Int, userId)
        .input('nombre_archivo', sql.VarChar, file.originalname)
        .input('ruta_archivo', sql.VarChar, filePath)
        .input('tipo_archivo', sql.VarChar, file.mimetype)
        .query(`
          INSERT INTO archivos_compartidos 
          (id_contratacion, id_usuario_subio, nombre_archivo, ruta_archivo, tipo_archivo)
          VALUES (@id_contratacion, @id_usuario_subio, @nombre_archivo, @ruta_archivo, @tipo_archivo)
        `);

      return {
        nombre: file.originalname,
        url: `/uploads/${id_contratacion}/${filename}`
      };
    } catch (error) {
      throw new Error(`Error al subir archivo: ${error.message}`);
    }
  }

  static async getFiles(id_contratacion, userId) {
    const pool = await getConnection();
    try {
      const result = await pool.request()
        .input('id_contratacion', sql.Int, id_contratacion)
        .input('userId', sql.Int, userId)
        .query(`
          SELECT 
            id_archivo,
            nombre_archivo,
            tipo_archivo,
            fecha_subida,
            ruta_archivo,
            CONCAT(u.nombre, ' ', u.apellido) as subido_por
          FROM archivos_compartidos a
          JOIN usuarios u ON a.id_usuario_subio = u.id_usuario
          WHERE a.id_contratacion = @id_contratacion
            AND EXISTS (
              SELECT 1 FROM contrataciones c
              JOIN servicios s ON c.id_servicio = s.id_servicio
              WHERE c.id_contratacion = @id_contratacion
                AND (c.id_cliente = @userId OR s.id_entrenador = @userId)
            )
            AND a.eliminado = 0
          ORDER BY fecha_subida DESC
        `);
      
      return result.recordset.map(file => {
        if (!file.ruta_archivo) {
          console.warn(`Archivo ${file.id_archivo} no tiene ruta definida`);
          return {
            ...file,
            url: null
          };
        }
        
        return {
          id_archivo: file.id_archivo,
          nombre_archivo: file.nombre_archivo,
          tipo_archivo: file.tipo_archivo,
          fecha_subida: file.fecha_subida,
          subido_por: file.subido_por,
          url: `/uploads/${id_contratacion}/${path.basename(file.ruta_archivo)}`
        };
      });
    } catch (error) {
      throw new Error(`Error al obtener archivos: ${error.message}`);
    }
  }
}

module.exports = File;