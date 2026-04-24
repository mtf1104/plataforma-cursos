const express = require('express');
const router = express.Router();

// Importamos el middleware que verifica si el usuario es administrador
const { verifyAdminToken } = require('../middlewares/authMiddleware');

// Importamos las funciones del controlador (igual que hiciste con register y login)
const { 
    getTeachers, 
    createTeacher, 
    createCourse, 
    getTopCoursesReport 
} = require('../controllers/adminController');

// Ruta: GET /api/admin/teachers (Para llenar el select)
router.get('/teachers', verifyAdminToken, getTeachers);

// Ruta: POST /api/admin/teachers (Para dar de alta un profesor)
router.post('/teachers', verifyAdminToken, createTeacher);

// Ruta: POST /api/admin/courses (Para dar de alta el curso y sus videos)
router.post('/courses', verifyAdminToken, createCourse);

// Ruta: GET /api/admin/reports/top-courses (Para ver estadísticas)
router.get('/reports/top-courses', verifyAdminToken, getTopCoursesReport);

module.exports = router;