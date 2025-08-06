// src/config/passport.js
require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const jwt = require('jsonwebtoken');

// Simulamos una base de datos de usuarios en memoria (en producción usar MongoDB/PostgreSQL)
const users = new Map();

// Configuración de Google OAuth
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Buscar usuario existente por email o googleId
        let user = Array.from(users.values()).find(u => 
            u.email === profile.emails[0].value || u.googleId === profile.id
        );

        if (user) {
            // Usuario existente - actualizar información si es necesario
            user.lastLogin = new Date();
            users.set(user.id, user);
            return done(null, user);
        }

        // Crear nuevo usuario
        const newUser = {
            id: Date.now().toString(),
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            provider: 'google',
            createdAt: new Date(),
            lastLogin: new Date()
        };

        users.set(newUser.id, newUser);
        return done(null, newUser);
    } catch (error) {
        return done(error, null);
    }
}));

// Configuración de GitHub OAuth
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = Array.from(users.values()).find(u => 
            u.email === (profile.emails && profile.emails[0] ? profile.emails[0].value : null) || 
            u.githubId === profile.id
        );

        if (user) {
            user.lastLogin = new Date();
            users.set(user.id, user);
            return done(null, user);
        }

        const newUser = {
            id: Date.now().toString(),
            githubId: profile.id,
            name: profile.displayName || profile.username,
            email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
            avatar: profile.photos[0].value,
            provider: 'github',
            username: profile.username,
            createdAt: new Date(),
            lastLogin: new Date()
        };

        users.set(newUser.id, newUser);
        return done(null, newUser);
    } catch (error) {
        return done(error, null);
    }
}));

// Serialización para sesiones (aunque usaremos JWT)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    const user = users.get(id);
    done(null, user);
});

// Función para generar JWT
const generateJWT = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            name: user.name,
            provider: user.provider
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
    );
};

// Exportar configuración y funciones
module.exports = {
    passport,
    users,
    generateJWT
};