const db = require('../config/db');

// Función para que el Admin registre a un profesor
const createTeacher = async (req, res) => {
    try {
        const { name, email, specialty } = req.body;

        // 1. Validar que vengan los datos requeridos
        if (!name || !email || !specialty) {
            return res.status(400).json({ message: 'Por favor, proporciona nombre, correo y especialidad del profesor' });
        }

        // 2. Insertar el profesor en la base de datos
        const [result] = await db.query(
            'INSERT INTO teachers (name, email, specialty) VALUES (?, ?, ?)',
            [name, email, specialty]
        );

        res.status(201).json({
            message: 'Profesor registrado exitosamente',
            teacherId: result.insertId
        });

    } catch (error) {
        console.error("Error al registrar profesor:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Ya existe un profesor con este correo' });
        }
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = { createTeacher };