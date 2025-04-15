const { getConnection, closePool } = require('../config/db');

async function testDatabase() {
  try {
    console.log('=== Iniciando prueba de conexión ===');
    
    const pool = await getConnection();
    console.log('✔ Conexión exitosa');
    
    // Test simple
    const result = await pool.request().query('SELECT 1 + 1 AS result');
    console.log('✔ Test query:', result.recordset[0].result);
    
    // Verificar tablas
    const tables = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
    `);
    console.log('✔ Tablas existentes:', tables.recordset.map(t => t.TABLE_NAME));
    
    // Verificar usuarios
    if (tables.recordset.some(t => t.TABLE_NAME === 'usuarios')) {
      const users = await pool.request().query('SELECT TOP 1 * FROM usuarios');
      console.log('✔ Usuario de ejemplo:', users.recordset[0] || 'Tabla vacía');
    }
    
    console.log('=== Prueba completada ===');
  } catch (error) {
    console.error('✖ Error en la prueba:', error.message);
    if (error.code) console.error('Código SQL:', error.code);
    if (error.number) console.error('Número error:', error.number);
  } finally {
    await closePool();
  }
}

testDatabase();