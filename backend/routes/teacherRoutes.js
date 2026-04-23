const express = require('express');
const router = express.Router();
const { createTeacher } = require('../controllers/teacherController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// Ruta: POST /api/teachers
// Fíjate cómo pasamos primero por verifyToken, luego por isAdmin, y si todo sale bien, ejecuta createTeacher
router.post('/', verifyToken, isAdmin, createTeacher);

module.exports = router;