const express = require('express');
const router = express.Router();
// Aquí está la línea combinada con las 3 funciones:
const { createCourse, addLesson, getCourses, getCourseDetails } = require('../controllers/courseController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');


// Ruta para ver todos los cursos: GET /api/courses
router.get('/', verifyToken, getCourses);

// Ruta para crear un curso: POST /api/courses
router.post('/', verifyToken, isAdmin, createCourse);

// Ruta para agregar una lección a un curso específico: POST /api/courses/:course_id/lessons
router.post('/:course_id/lessons', verifyToken, isAdmin, addLesson);

// Ruta para ver los detalles y lecciones de un curso específico
router.get('/:id', verifyToken, getCourseDetails);

module.exports = router;