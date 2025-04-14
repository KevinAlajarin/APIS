// server/routes/auth.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Endpoint de prueba
router.get('/test-db', async (req, res) => {
try {
    const request = pool.request();
    const result = await request.query('SELECT TOP 1 * FROM usuarios');
    res.json(result.recordset);
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

module.exports = router;