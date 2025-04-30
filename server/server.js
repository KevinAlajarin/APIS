const path = require('path');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool, getConnection } = require('./src/config/db'); 
const { swaggerUi, specs } = require('./src/utils/swagger');
//const fileUpload = require('express-fileupload');

const servicesRoutes = require('./src/routes/servicesRoutes');
const authRoutes = require('./src/routes/authRoutes');
const authenticate = require('./src/middlewares/authMiddleware');
const usersRoutes = require('./src/routes/userRoutes');
const contratacionesRoutes = require('./src/routes/contratacionesRoutes');
const pagosRoutes = require('./src/routes/pagosRoutes');
const reseniasRoutes = require('./src/routes/reseniasRoutes');
const statsRoutes = require('./src/routes/statsRoutes');
const chatRoutes = require('./src/routes/chatRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
//app.use(fileUpload()); // Mover esto antes de las rutas que lo usan
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/services', servicesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/contrataciones', contratacionesRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/resenias', reseniasRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api', chatRoutes);

// Asegurar que el webhook usa body raw
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexion a la base de datos
(async () => {
  try {
    await getConnection(); 
    console.log('✅ Conectado a SQL Server');
  } catch (err) {
    console.error('❌ Error de conexión:', err);
  }
})();

// Rutas básicas
app.get('/', (req, res) => {
  res.send('🚀 Backend funcionando');
});

app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: '🔐 Ruta protegida', user: req.user });
});

// Manejo de errores
app.use((req, res) => {
  res.status(404).json({ error: '🔍 Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error('🔥 Error:', err);
  res.status(500).json({ error: '💥 Error interno' });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});