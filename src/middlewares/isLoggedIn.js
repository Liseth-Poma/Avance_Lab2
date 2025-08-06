// src/middlewares/isLoggedIn.js - Actualizado para soportar JWT
const jwt = require('jsonwebtoken');
const { users } = require('../config/passport');

module.exports = (req, res, next) => {
    // Verificar cookie de usuario tradicional (backwards compatibility)
    if (req.cookies.username) {
        return next();
    }

    // Verificar JWT token
    const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];
    
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            
            // Verificar que el usuario existe
            const user = users.get(decoded.id);
            if (user) {
                req.user = decoded;
                // Setear cookie de username para compatibilidad con el chat existente
                res.cookie('username', decoded.name || decoded.email, { 
                    maxAge: 24 * 60 * 60 * 1000 // 24 horas
                });
                return next();
            }
        } catch (error) {
            console.error('Error verificando JWT:', error.message);
        }
    }

    // Si no hay autenticación válida, redirigir al login
    res.redirect('/login');
};