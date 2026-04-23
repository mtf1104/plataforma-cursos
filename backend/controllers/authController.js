const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Función para registrar un nuevo usuario
const register = async (req, res) => {
    try {
        // Extraemos los datos que envía el frontend o móvil
        const { full_name, email, password } = req.body;

        // 1. Verificar que vengan todos los datos
        if (!full_name || !email || !password) {
            return res.status(400).json({ message: 'Por favor, proporciona nombre, correo y contraseña' });
        }

        // 2. Encriptar la contraseña (¡nunca se guardan en texto plano!)
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 3. Insertar el usuario en TiDB (por defecto el rol será 'client' según tu BD)
        const [result] = await db.query(
            'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)',
            [full_name, email, password_hash]
        );

        res.status(201).json({ 
            message: 'Usuario registrado exitosamente', 
            userId: result.insertId 
        });

    } catch (error) {
        console.error("Error en el registro:", error);
        // Si el error es por correo duplicado (código de MySQL)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Este correo ya está registrado' });
        }
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Función para iniciar sesión
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Verificar que vengan los datos
        if (!email || !password) {
            return res.status(400).json({ message: 'Por favor, proporciona correo y contraseña' });
        }

        // 2. Buscar al usuario en la base de datos
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        // Si no existe el usuario, devolvemos error genérico por seguridad
        if (users.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = users[0];

        // 3. Comparar la contraseña enviada con el hash de la base de datos
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // 4. Generar el Token (JWT)
        const token = jwt.sign(
            { id: user.id, role: user.role }, // Datos útiles que viajan en el token
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // El token caduca en 24 horas
        );

        // 5. Enviar respuesta exitosa con el token y datos del usuario
        res.json({
            message: 'Login exitoso',
            token,
            user: { 
                id: user.id, 
                full_name: user.full_name, 
                role: user.role,
                theme: user.theme
            }
        });

    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// No olvides exportar la nueva función
module.exports = { register, login };
