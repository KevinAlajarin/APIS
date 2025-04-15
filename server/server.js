require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool, getConnection} = require('./src/config/db'); 
const { swaggerUi, specs } = require('./src/utils/swagger');

const authRoutes = require('./src/routes/authRoutes');
const authenticate = require('./src/middlewares/authMiddleware');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


// Conexión a DB (versión corregida)
(async () => {
  try {
    await getConnection(); // Ahora esta función existe
    console.log('✅ Conectado a SQL Server');
  } catch (err) {
    console.error('❌ Error de conexión:', err);
  }
})();

// Rutas
app.get('/', (req, res) => {
  res.send('🚀 Backend funcionando');
});

// Asegúrate de que authRoutes esté correctamente importado
app.use('/api/auth', authRoutes);

// Ruta protegida de ejemplo
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