const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const Contratacion = require('../models/Contratacion');

// Configuración
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: { integratorId: process.env.MERCADOPAGO_INTEGRATOR_ID }
});

const preference = new Preference(client);
const paymentClient = new Payment(client);

const createPaymentPreference = async (req, res) => {
  try {
    const { hire_id: id_contratacion } = req.body;
    const contratacion = await Contratacion.getById(id_contratacion);
    
    if (!contratacion) {
      return res.status(404).json({ error: 'Hire not found' });
    }

    const preferenceData = {
      body: {
        items: [{
          title: `Service ${contratacion.servicio_descripcion.substring(0, 50)}`,
          unit_price: Number(contratacion.precio_servicio),
          quantity: 1,
          currency_id: 'ARS'
        }],
        payer: {
          email: req.user.email,
          name: req.user.nombre
        },
        payment_methods: {
          excluded_payment_types: [{ id: 'atm' }],
          installments: 1
        },
        external_reference: id_contratacion.toString(),
        notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
        back_urls: {
          success: `${process.env.FRONTEND_URL}/payment-success?id=${id_contratacion}`,
          failure: `${process.env.FRONTEND_URL}/payment-failed?id=${id_contratacion}`,
        },
        auto_return: 'approved',
        binary_mode: true
      }
    };

    const response = await preference.create(preferenceData);
    res.json({ 
      preference_id: response.id, 
      payment_url: response.init_point,
      hire_id: id_contratacion
    });

  } catch (error) {
    console.error('[ERROR] MercadoPago:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error creating payment preference' });
  }
};

const handlePaymentWebhook = async (req, res) => {
  try {
    const paymentId = req.query.id || req.body.data.id;
    if (!paymentId) return res.status(400).send('Missing data');

    // Validar firma 
    const signature = req.headers['x-signature'];
    if (!signature) return res.status(403).send('Unauthorized');

    // Obtener pago
    const payment = await paymentClient.get({ id: paymentId });
    const { external_reference: id_contratacion } = payment;

    // Actualizar estado
    if (payment.status === 'approved') {
      await Contratacion.actualizarEstadoPago(id_contratacion, 'exitoso', {
        id_pago: payment.id.toString(),
        fecha: new Date(payment.date_approved),
        metodo: payment.payment_type_id
      });
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('[ERROR] Webhook:', error);
    res.status(400).json({ error: 'Webhook failed' });
  }
};

module.exports = {
  createPaymentPreference,
  handlePaymentWebhook
};