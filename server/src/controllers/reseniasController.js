const Review = require('../models/Resenia');
const { validationResult } = require('express-validator');

const createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { hire_id, rating, comment } = req.body;
    const reviewId = await Review.create(
      hire_id,
      req.user.id_usuario,
      rating,
      comment
    );

    res.status(201).json({ id: reviewId });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

const getTrainerReviews = async (req, res) => {
  try {
    const reviews = await Review.getByEntrenador(req.params.id);
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error getting reviews' });
  }
};

const getClientReviews = async (req, res) => {
  try {
    const reviews = await Review.getByCliente(req.params.id);
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error getting reviews' });
  }
};

const addReviewResponse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text } = req.body;
    await Review.addRespuesta(
      req.params.id,
      req.user.id_usuario,
      text
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const isAdmin = req.user.id_rol === 1;
    await Review.delete(
      req.params.id,
      req.user.id_usuario,
      isAdmin
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createReview,
  getTrainerReviews,
  getClientReviews,
  addReviewResponse,
  deleteReview
};