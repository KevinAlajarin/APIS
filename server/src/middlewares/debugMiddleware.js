// server/src/middlewares/debugMiddleware.js
module.exports = (req, res, next) => {
    console.log('Datos del usuario autenticado:', req.user);
    next();
  };