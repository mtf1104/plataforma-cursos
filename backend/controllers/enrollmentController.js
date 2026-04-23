const db = require('../config/db');

// Función para que un Cliente se inscriba a un curso
const enrollCourse = async (req, res) => {
    try {
        const userId = req.user.id; // Lo sacamos del token, es 100% seguro
        const { course_id } = req.body;

        if (!course_id) {
            return res.status(400).json({ message: 'El ID del curso es obligatorio' });
        }

        // 1. Verificar si el usuario ya está inscrito en este curso
        const [existingEnrollment] = await db.query(
            'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
            [userId, course_id]
        );

        if (existingEnrollment.length > 0) {
            return res.status(400).json({ message: 'Ya estás inscrito en este curso' });
        }

        // 2. Registrar la inscripción
        const [enrollmentResult] = await db.query(
            'INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)',
            [userId, course_id]
        );
        const enrollmentId = enrollmentResult.insertId;

        // 3. Obtener todas las lecciones de este curso para armar el panel de progreso
        const [lessons] = await db.query(
            'SELECT id FROM lessons WHERE course_id = ?',
            [course_id]
        );

        // 4. Si el curso tiene lecciones, las insertamos en la tabla de progreso de este usuario
        if (lessons.length > 0) {
            // Preparamos los datos en un formato masivo para insertarlos de un solo golpe
            const progressData = lessons.map(lesson => [enrollmentId, lesson.id]);
            
            await db.query(
                'INSERT INTO lesson_progress (enrollment_id, lesson_id) VALUES ?',
                [progressData]
            );
        }

        res.status(201).json({ 
            message: 'Inscripción exitosa. ¡A estudiar!',
            enrollmentId: enrollmentId 
        });

    } catch (error) {
        console.error("Error al inscribirse:", error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ message: 'El curso especificado no existe' });
        }
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = { enrollCourse };