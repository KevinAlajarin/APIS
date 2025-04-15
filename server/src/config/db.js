const sql = require('mssql');
const dotenv = require('dotenv');
dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool;

async function getConnection() {
  try {
    if (pool) return pool;
    
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('Conexión a SQL Server establecida');
    return pool;
  } catch (err) {
    console.error('Error al conectar a SQL Server:', err);
    throw err;
  }
}

async function closePool() {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('✅ Pool de conexiones cerrado');
    }
  }

module.exports = {
  sql,
  getConnection,
  closePool: async () => {
    if (pool) {
      await pool.close();
      pool = null;
    }
  }
};