// src/routes/auth.js
const express = require('express');
const { passport, generateJWT } = require('../config/passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Rutas para Google OAuth
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        try {
            if (!req.user) {
                return res.redirect('/login?error=authentication_failed');
            }

            // Generar JWT después de autenticación exitosa
            const token = generateJWT(req.user);
            
            // Establecer cookies directamente en el servidor
            res.cookie('jwt', token, {
                maxAge: 24 * 60 * 60 * 1000, // 24 horas
                httpOnly: false, // Permitir acceso desde JavaScript
                secure: false, // En desarrollo usar false, en producción true
                sameSite: 'lax'
            });
            
            res.cookie('username', req.user.name || req.user.email, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: false,
                secure: false,
                sameSite: 'lax'
            });

            // Redirigir directamente al chat
            res.redirect('/?auth=success');
        } catch (error) {
            console.error('Error en callback de Google:', error);
            res.redirect('/login?error=callback_error');
        }
    }
);

// Rutas para GitHub OAuth
router.get('/github',
    passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
    passport.authenticate('github', { session: false }),
    (req, res) => {
        try {
            if (!req.user) {
                return res.redirect('/login?error=authentication_failed');
            }

            const token = generateJWT(req.user);
            
            res.cookie('jwt', token, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: false,
                secure: false,
                sameSite: 'lax'
            });
            
            res.cookie('username', req.user.name || req.user.email, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: false,
                secure: false,
                sameSite: 'lax'
            });

            res.redirect('/?auth=success');
        } catch (error) {
            console.error('Error en callback de GitHub:', error);
            res.redirect('/login?error=callback_error');
        }
    }
);

// Middleware para verificar JWT
const verifyJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.jwt;
    
    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
};

// Ruta para obtener información del usuario actual
router.get('/me', verifyJWT, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

// Ruta para logout
router.post('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.clearCookie('username');
    res.json({ success: true, message: 'Logout exitoso' });
});

// Ruta de prueba protegida
router.get('/protected', verifyJWT, (req, res) => {
    res.json({
        success: true,
        message: 'Acceso autorizado',
        user: req.user
    });
});

module.exports = { authRouter: router, verifyJWT };