const db = require('../config/db');

// Función para marcar una lección como completada
const completeLesson = async (req, res) => {
    try {
        const userId = req.user.id;
        const { lesson_id } = req.params;

        // 1. Obtener datos de la inscripción y la lección actual
        const [enrollmentData] = await db.query(`
            SELECT e.id AS enrollment_id, e.course_id, l.sequence_order
            FROM enrollments e
            JOIN lessons l ON e.course_id = l.course_id
            WHERE e.user_id = ? AND l.id = ?
        `, [userId, lesson_id]);

        if (enrollmentData.length === 0) {
            return res.status(404).json({ message: 'No estás inscrito en este curso o la lección no existe' });
        }

        const { enrollment_id, course_id, sequence_order } = enrollmentData[0];

        // 2. Validación de secuencia (Evitar que se salten lecciones)
        if (sequence_order > 1) {
            const [prevLesson] = await db.query(`
                SELECT lp.is_completed 
                FROM lesson_progress lp
                JOIN lessons l ON lp.lesson_id = l.id
                WHERE lp.enrollment_id = ? AND l.course_id = ? AND l.sequence_order = ?
            `, [enrollment_id, course_id, sequence_order - 1]);

            if (prevLesson.length === 0 || prevLesson[0].is_completed === 0) {
                return res.status(403).json({ message: 'No puedes saltarte lecciones. Completa la anterior primero.' });
            }
        }

        // 3. Marcar lección como completada y sumar una vista
        await db.query(
            'UPDATE lesson_progress SET is_completed = TRUE, views = views + 1 WHERE enrollment_id = ? AND lesson_id = ?',
            [enrollment_id, lesson_id]
        );

        // 4. Verificar si ya completó TODAS las lecciones de este curso
        const [pendingLessons] = await db.query(`
            SELECT id FROM lesson_progress 
            WHERE enrollment_id = ? AND is_completed = FALSE
        `, [enrollment_id]);

        if (pendingLessons.length === 0) {
            // Generamos un certificado simulado y cambiamos el status
            const certUrl = `https://tuplataforma.com/certificados/user_${userId}_course_${course_id}.pdf`;
            await db.query(
                'UPDATE enrollments SET status = "completed", completed_at = CURRENT_TIMESTAMP, certificate_url = ? WHERE id = ?',
                [certUrl, enrollment_id]
            );
            return res.json({ message: '¡Lección completada! Felicidades, has terminado el curso.', certificate_url: certUrl });
        }

        res.json({ message: 'Lección completada exitosamente' });

    } catch (error) {
        console.error("Error al completar lección:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Función para dejar una reseña (Solo si el curso está completado)
const addReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { course_id } = req.params;
        const { rating, comment } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({ message: 'La calificación y el comentario son obligatorios' });
        }

        // 1. Verificar que el usuario haya terminado el curso
        const [enrollment] = await db.query(
            'SELECT status FROM enrollments WHERE user_id = ? AND course_id = ?',
            [userId, course_id]
        );

        if (enrollment.length === 0 || enrollment[0].status !== 'completed') {
            return res.status(403).json({ message: 'Debes terminar el curso completo para poder calificarlo' });
        }

        // 2. Insertar la reseña
        await db.query(
            'INSERT INTO reviews (user_id, course_id, rating, comment) VALUES (?, ?, ?, ?)',
            [userId, course_id, rating, comment]
        );

        res.status(201).json({ message: 'Reseña publicada exitosamente. ¡Gracias por tu retroalimentación!' });

    } catch (error) {
        console.error("Error al publicar reseña:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = { completeLesson, addReview };