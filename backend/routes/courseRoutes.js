const express = require('express');
const router = express.Router();
const { createCourse, addLesson } = require('../controllers/courseController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// Ruta para crear un curso: POST /api/courses
router.post('/', verifyToken, isAdmin, createCourse);

// Ruta para agregar una lección a un curso específico: POST /api/courses/:course_id/lessons
router.post('/:course_id/lessons', verifyToken, isAdmin, addLesson);

module.exports = router;