const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE || 'gmail', // Usa el servicio directamente
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendPasswordResetEmail = async (email, token) => {
  const resetLink = `${process.env.FRONTEND_URL}/resetear-contrasena?token=${token}`;

  await transporter.sendMail({
    from: '"Marketplace Entrenadores" <no-reply@example.com>',
    to: email,
    subject: 'Restablecer tu contraseña',
    html: `
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>El enlace expira en 1 hora.</p>
    `,
  });
};

module.exports = { sendPasswordResetEmail };