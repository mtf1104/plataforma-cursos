const jwt = require('jsonwebtoken');

// 1. Verificar que el usuario está logueado (tiene un token válido)
const verifyToken = (req, res, next) => {
    // El token suele enviarse en los headers como "Bearer <token>"
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: 'Acceso denegado. No hay token.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
         return res.status(401).json({ message: 'Formato de token inválido.' });
    }

    try {
        // Desencriptamos el token con nuestra clave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Guardamos los datos del usuario (id, role) en req.user para usarlos más adelante
        req.user = decoded;
        
        // Todo en orden, dejamos que la petición continúe su camino
        next(); 
    } catch (error) {
        return res.status(403).json({ message: 'Token inválido o expirado.' });
    }
};

// 2. Verificar que el usuario tiene el rol de 'admin'
const isAdmin = (req, res, next) => {
    // Asumimos que verifyToken ya se ejecutó antes y nos dejó los datos en req.user
    if (req.user && req.user.role === 'admin') {
        next(); // Es admin, lo dejamos pasar a crear cursos o profesores
    } else {
        return res.status(403).json({ message: 'Acceso denegado. Requiere permisos de Administrador.' });
    }
};

module.exports = { verifyToken, isAdmin };