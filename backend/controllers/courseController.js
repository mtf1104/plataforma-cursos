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

// Función para obtener todos los cursos (Para el Catálogo)
const getCourses = async (req, res) => {
    try {
        const [courses] = await db.query(`
            SELECT c.id, c.title, t.name AS teacher_name 
            FROM courses c 
            JOIN teachers t ON c.teacher_id = t.id
        `);
        res.json(courses);
    } catch (error) {
        console.error("Error al obtener cursos:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener detalles de un curso específico y sus lecciones
const getCourseDetails = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Obtenemos los datos del curso
        const [course] = await db.query('SELECT id, title FROM courses WHERE id = ?', [id]);
        if (course.length === 0) return res.status(404).json({ message: 'Curso no encontrado' });

        // Obtenemos sus lecciones ordenadas
        const [lessons] = await db.query('SELECT id, title, video_url, sequence_order FROM lessons WHERE course_id = ? ORDER BY sequence_order ASC', [id]);

        res.json({ course: course[0], lessons });
    } catch (error) {
        console.error("Error al obtener detalles del curso:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = { createCourse, addLesson, getCourses, getCourseDetails };