const express = require('express');
const router = express.Router();
const { updateProfile } = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Ruta: PUT /api/users/profile
// Usamos PUT porque la convención REST dicta que se usa para actualizar datos existentes
router.put('/profile', verifyToken, updateProfile);

module.exports = router;