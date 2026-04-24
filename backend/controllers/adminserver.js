const db = require('../config/db');

// Obtener lista de profesores (Para el select)
const getTeachers = async (req, res) => {
    try {
        const [teachers] = await db.query('SELECT id, name, specialty FROM teachers ORDER BY name ASC');
        res.json(teachers);
    } catch (error) {
        console.error("Error al obtener profesores:", error);
        res.status(500).json({ message: 'Error al obtener profesores' });
    }
};

// Dar de alta a un profesor
const createTeacher = async (req, res) => {
    const { name, email, specialty } = req.body;
    try {
        await db.query(
            'INSERT INTO teachers (name, email, specialty) VALUES (?, ?, ?)',
            [name, email, specialty]
        );
        res.status(201).json({ message: 'Profesor registrado correctamente' });
    } catch (error) {
        console.error("Error al registrar profesor:", error);
        res.status(500).json({ message: 'Error al registrar profesor' });
    }
};

// Dar de alta un curso y su secuencia de videos (Transacción)
const createCourse = async (req, res) => {
    const { title, teacher_id, lessons } = req.body;
    
    // Obtenemos una conexión individual del pool para la transacción
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction(); 

        // 1. Insertar el curso
        const [courseResult] = await connection.query(
            'INSERT INTO courses (title, teacher_id) VALUES (?, ?)',
            [title, teacher_id]
        );
        const courseId = courseResult.insertId;

        // 2. Insertar las lecciones ligadas al curso
        if (lessons && lessons.length > 0) {
            for (const lesson of lessons) {
                await connection.query(
                    'INSERT INTO lessons (course_id, title, video_url, sequence_order) VALUES (?, ?, ?, ?)',
                    [courseId, lesson.title, lesson.video_url, lesson.sequence_order]
                );
            }
        }

        await connection.commit(); 
        res.status(201).json({ message: 'Curso y videos guardados con éxito' });
    } catch (error) {
        await connection.rollback(); 
        console.error("Error al registrar el curso:", error);
        res.status(500).json({ message: 'Error al registrar el curso y las lecciones' });
    } finally {
        connection.release();
    }
};

// Reporte: Cursos más aceptados
const getTopCoursesReport = async (req, res) => {
    try {
        const sqlQuery = `
            SELECT 
                c.title,
                COALESCE(SUM(lp.views), 0) AS total_views,
                COALESCE(ROUND(AVG(r.rating), 1), 0) AS avg_rating,
                COUNT(DISTINCT r.id) AS total_reviews
            FROM courses c
            LEFT JOIN lessons l ON c.id = l.course_id
            LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id
            LEFT JOIN reviews r ON c.id = r.course_id
            GROUP BY c.id
            ORDER BY avg_rating DESC, total_views DESC;
        `;
        
        const [reports] = await db.query(sqlQuery);
        res.json(reports);
    } catch (error) {
        console.error("Error al generar el reporte:", error);
        res.status(500).json({ message: 'Error al generar el reporte' });
    }
};

// Exportamos todas las funciones al estilo de tu authController
module.exports = { 
    getTeachers, 
    createTeacher, 
    createCourse, 
    getTopCoursesReport 
};