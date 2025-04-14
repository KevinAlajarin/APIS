// server/db.js
const sql = require('mssql');
require('dotenv').config();

const config = {
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
server: process.env.DB_SERVER, // Ej: 'localhost' o 'nombre_servidor'
database: process.env.DB_NAME,
options: {
    encrypt: true, // Para Azure o conexiones SSL
    trustServerCertificate: true, // Solo para desarrollo
},
pool: {
    max: 10, // Máximo de conexiones en el pool
    min: 0,
    idleTimeoutMillis: 30000,
},
};

// Crear el pool de conexiones
const pool = new sql.ConnectionPool(config);

// Conectar y exportar el pool
pool.connect()
.then(() => console.log('Conectado a SQL Server'))
.catch(err => console.error('Error de conexión:', err));

module.exports = {
pool,
sql,
};