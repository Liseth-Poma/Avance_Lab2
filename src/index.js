// src/index.js - Actualizado con OAuth
const express = require('express');
const { createServer } = require('http');
const realTimeServer = require('./realTimeServer');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');

// Importar configuración OAuth
const { passport } = require('./config/passport');
const { authRouter } = require('./routes/auth');



// Cargar variables de entorno
require('dotenv').config();

const app = express();
const httpServer = createServer(app);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configuración de CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Configuración de sesiones (necesario para Passport.js)
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // En producción usar true con HTTPS
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Configuraciones
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));

// Rutas de autenticación
app.use('/auth', authRouter);



// Rutas existentes
app.use(require('./routes'));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta de prueba para verificar el servidor
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor funcionando correctamente',
        oauth: {
            google: !!process.env.GOOGLE_CLIENT_ID,
            github: !!process.env.GITHUB_CLIENT_ID
        }
    });
});

// Manejo de errores
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Algo salió mal'
    });
});

// Iniciar el servidor
httpServer.listen(app.get('port'), () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${app.get('port')}`);
    console.log(`🔐 OAuth configurado:`);
    console.log(`   Google: ${process.env.GOOGLE_CLIENT_ID ? '✅' : '❌'}`);
    console.log(`   GitHub: ${process.env.GITHUB_CLIENT_ID ? '✅' : '❌'}`);
    console.log(`📋 Rutas OAuth disponibles:`);
    console.log(`   GET  /auth/google`);
    console.log(`   GET  /auth/github`);
    console.log(`   GET  /auth/me`);
    console.log(`   POST /auth/logout`);
});

// Configurar servidor en tiempo real con autenticación
realTimeServer(httpServer);

module.exports = app;