const express = require('express');
const router = express.Router();
const { enrollCourse } = require('../controllers/enrollmentController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Ruta: POST /api/enrollments
router.post('/', verifyToken, enrollCourse);

module.exports = router;