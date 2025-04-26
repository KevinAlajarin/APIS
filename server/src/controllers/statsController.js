// server/src/controllers/statsController.js
const Stats = require('../models/Stats');
const authenticate = require('../middlewares/authMiddleware');

const getStats = async (req, res) => {
  try {
    // Solo entrenadores pueden ver sus stats
    if (req.user.id_rol !== 3) {
      return res.status(403).json({ error: 'Solo entrenadores pueden ver estadísticas' });
    }

    const stats = await Stats.getByEntrenador(req.user.id_usuario);
    const serviciosPopulares = await Stats.getServiciosPopulares(req.user.id_usuario);

    res.json({
      ...stats,
      servicios_populares: serviciosPopulares
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

module.exports = {
  getStats
};