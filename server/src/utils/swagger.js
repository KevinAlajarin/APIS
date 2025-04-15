const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Marketplace de Entrenadores - API',
      version: '1.0.0',
      description: 'Documentación de la API para el TP Obligatorio',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Servidor local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // Ruta a tus archivos de rutas
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };