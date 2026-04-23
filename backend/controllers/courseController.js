const db = require('../config/db');

// Función para crear un curso (Solo Admin)
const createCourse = async (req, res) => {
    try {
        const { title, teacher_id } = req.body;

        if (!title || !teacher_id) {
            return res.status(400).json({ message: 'El título y el ID del profesor son obligatorios' });
        }

        const [result] = await db.query(
            'INSERT INTO courses (title, teacher_id) VALUES (?, ?)',
            [title, teacher_id]
        );

        res.status(201).json({
            message: 'Curso creado exitosamente',
            courseId: result.insertId
        });

    } catch (error) {
        console.error("Error al crear curso:", error);
        // Si el teacher_id no existe en la tabla teachers
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ message: 'El ID del profesor no existe' });
        }
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Función para agregar un video/lección a un curso (Solo Admin)
const addLesson = async (req, res) => {
    try {
        const { course_id } = req.params; // Lo sacamos de la URL
        const { title, video_url, sequence_order } = req.body;

        if (!title || !video_url || !sequence_order) {
            return res.status(400).json({ message: 'Faltan datos de la lección' });
        }

        const [result] = await db.query(
            'INSERT INTO lessons (course_id, title, video_url, sequence_order) VALUES (?, ?, ?, ?)',
            [course_id, title, video_url, sequence_order]
        );

        res.status(201).json({
            message: 'Lección agregada exitosamente',
            lessonId: result.insertId
        });

    } catch (error) {
        console.error("Error al agregar lección:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = { createCourse, addLesson };