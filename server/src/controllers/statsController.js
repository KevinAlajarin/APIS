const Stats = require('../models/Stats');

const getTrainerStats = async (req, res) => {
  try {
    const trainerId = parseInt(req.params.id);
    
    // Verificar que el usuario solicitante es el mismo entrenador o admin
    if (req.user.id_rol !== 1 && req.user.id_usuario !== trainerId) {
      return res.status(403).json({ error: 'Unauthorized access to trainer stats' });
    }

    const stats = await Stats.getByEntrenador(trainerId);
    const popularServices = await Stats.getServiciosPopulares(trainerId);

    res.json({
      totalViews: stats.total_visualizaciones,
      conversionRate: stats.tasa_conversion,
      averageRating: stats.promedio_calificaciones,
      totalReviews: stats.total_calificaciones,
      ratingDistribution: stats.distribucion_calificaciones,
      popularServices: popularServices.map(service => ({
        serviceId: service.id_servicio,
        description: service.descripcion,
        totalHires: service.total_contrataciones,
        views: service.visualizaciones
      }))
    });
  } catch (error) {
    console.error('Error getting trainer stats:', error);
    res.status(500).json({ error: 'Failed to get trainer statistics' });
  }
};

module.exports = {
  getTrainerStats
};