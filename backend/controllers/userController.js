const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Función para actualizar el perfil del usuario (Cliente o Admin)
const updateProfile = async (req, res) => {
    try {
        // Obtenemos el ID del usuario directamente del token (así evitamos que alguien modifique el ID en la URL)
        const userId = req.user.id; 
        const { password, profile_image, theme } = req.body;

        // Arreglos para construir la consulta SQL dinámicamente
        let updateFields = [];
        let queryParams = [];

        // Si el usuario envió una nueva contraseña, la encriptamos
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);
            updateFields.push('password_hash = ?');
            queryParams.push(password_hash);
        }

        // Si envió una nueva imagen
        if (profile_image) {
            updateFields.push('profile_image = ?');
            queryParams.push(profile_image);
        }

        // Si envió un cambio de tema (validamos que solo sea 'light' o 'dark')
        if (theme && ['light', 'dark'].includes(theme)) {
            updateFields.push('theme = ?');
            queryParams.push(theme);
        }

        // Si no envió nada, avisamos del error
        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No se enviaron datos para actualizar' });
        }

        // Agregamos el ID del usuario al final de los parámetros para el WHERE
        queryParams.push(userId);

        // Construimos la consulta SQL final (ej: UPDATE users SET theme = ?, profile_image = ? WHERE id = ?)
        const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        
        await db.query(query, queryParams);

        res.json({ message: 'Perfil actualizado exitosamente' });

    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = { updateProfile };