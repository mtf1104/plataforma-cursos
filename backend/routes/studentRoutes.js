const express = require('express');
const router = express.Router();
const { completeLesson, addReview } = require('../controllers/studentController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Ruta para marcar un video como completado: PUT /api/student/lessons/:lesson_id/complete
router.put('/lessons/:lesson_id/complete', verifyToken, completeLesson);

// Ruta para dejar una reseña en un curso: POST /api/student/courses/:course_id/reviews
router.post('/courses/:course_id/reviews', verifyToken, addReview);

module.exports = router;