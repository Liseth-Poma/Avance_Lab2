// src/realTimeServer.js - Actualizado con soporte OAuth
module.exports = (httpServer) => {
  const { Server } = require('socket.io');
  const jwt = require('jsonwebtoken');
  const { users } = require('./config/passport');
  
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  const connectedUsers = new Map(); // Mapa para almacenar usuarios conectados

  // Middleware de autenticación para Socket.IO
  io.use((socket, next) => {
    try {
      // Obtener token de las cookies o headers
      const token = socket.handshake.auth.token || 
                   socket.handshake.headers.cookie
                     ?.split('; ')
                     .find(row => row.startsWith('jwt='))
                     ?.split('=')[1];

      if (token) {
        // Verificar JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = users.get(decoded.id);
        
        if (user) {
          socket.userProfile = user;
          socket.username = user.name || user.email;
          return next();
        }
      }

      // Fallback para usuarios con método tradicional
      const cookies = socket.handshake.headers.cookie;
      if (cookies) {
        const usernameCookie = cookies
          .split('; ')
          .find(row => row.startsWith('username='))
          ?.split('=')[1];

        if (usernameCookie) {
          socket.username = decodeURIComponent(usernameCookie);
          socket.userProfile = null; // Usuario tradicional sin perfil OAuth
          return next();
        }
      }

      // No hay autenticación válida
      next(new Error('Authentication required'));
    } catch (error) {
      console.error('Error en autenticación Socket.IO:', error.message);
      next(new Error('Invalid authentication'));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Usuario conectado: ${socket.username} (${socket.id})`);

    // Manejar registro de usuario
    socket.on("register", (data) => {
      try {
        let username, userProfile;

        // Manejar tanto formato nuevo (objeto) como viejo (string)
        if (typeof data === 'object' && data.username) {
          username = data.username;
          userProfile = data.userProfile || socket.userProfile;
        } else {
          username = data || socket.username;
          userProfile = socket.userProfile;
        }

        // Verificar si es un nuevo usuario
        const existingUser = Array.from(connectedUsers.values())
          .find(user => user.username === username);
        
        const isNewUser = !existingUser;

        // Almacenar información del usuario conectado
        const userInfo = {
          socketId: socket.id,
          username: username,
          userProfile: userProfile,
          connectedAt: new Date(),
          isNewUser: isNewUser
        };

        connectedUsers.set(socket.id, userInfo);
        socket.username = username;
        socket.userProfile = userProfile;

        // Confirmar registro al cliente
        socket.emit("registered", { 
          username, 
          isNewUser,
          userProfile: userProfile
        });

        // Notificar a todos los usuarios sobre la nueva conexión
        if (userProfile && userProfile.provider) {
          socket.broadcast.emit("userJoined", {
            username: username,
            provider: userProfile.provider,
            avatar: userProfile.avatar
          });
        }

        console.log(`Usuario registrado: ${username}${userProfile?.provider ? ` (${userProfile.provider})` : ''}`);
        
        // Log de usuarios conectados
        console.log(`Usuarios conectados: ${connectedUsers.size}`);

      } catch (error) {
        console.error('Error en registro:', error);
        socket.emit('error', { message: 'Error en el registro' });
      }
    });

    // Manejar envío de mensajes
    socket.on("message", (data) => {
      try {
        const userInfo = connectedUsers.get(socket.id);
        
        if (!userInfo) {
          socket.emit('error', { message: 'Usuario no registrado' });
          return;
        }

        let message, userProfile, timestamp;

        // Manejar tanto formato nuevo (objeto) como viejo (string)
        if (typeof data === 'object') {
          message = data.message;
          userProfile = data.userProfile || userInfo.userProfile;
          timestamp = data.timestamp || new Date().toISOString();
        } else {
          message = data;
          userProfile = userInfo.userProfile;
          timestamp = new Date().toISOString();
        }

        if (!message || message.trim() === '') {
          return;
        }

        // Preparar datos del mensaje
        const messageData = {
          user: userInfo.username,
          message: message.trim(),
          userProfile: userProfile,
          timestamp: timestamp,
          socketId: socket.id
        };

        // Enviar mensaje a todos los usuarios conectados
        io.emit("message", messageData);

        console.log(`Mensaje de ${userInfo.username}: ${message.slice(0, 50)}${message.length > 50 ? '...' : ''}`);

      } catch (error) {
        console.error('Error enviando mensaje:', error);
        socket.emit('error', { message: 'Error enviando mensaje' });
      }
    });

    // Manejar eventos de typing (opcional)
    socket.on("typing", () => {
      const userInfo = connectedUsers.get(socket.id);
      if (userInfo) {
        socket.broadcast.emit("userTyping", {
          username: userInfo.username,
          avatar: userInfo.userProfile?.avatar
        });
      }
    });

    socket.on("stopTyping", () => {
      const userInfo = connectedUsers.get(socket.id);
      if (userInfo) {
        socket.broadcast.emit("userStoppedTyping", {
          username: userInfo.username
        });
      }
    });

    // Manejar solicitud de usuarios conectados
    socket.on("getConnectedUsers", () => {
      const usersList = Array.from(connectedUsers.values()).map(user => ({
        username: user.username,
        avatar: user.userProfile?.avatar,
        provider: user.userProfile?.provider,
        connectedAt: user.connectedAt
      }));
      
      socket.emit("connectedUsers", usersList);
    });

    // Manejar desconexión
    socket.on("disconnect", (reason) => {
      const userInfo = connectedUsers.get(socket.id);
      
      if (userInfo) {
        console.log(`Usuario desconectado: ${userInfo.username} (${reason})`);
        
        // Notificar a otros usuarios
        socket.broadcast.emit("userLeft", {
          username: userInfo.username,
          avatar: userInfo.userProfile?.avatar,
          reason: reason
        });
        
        // Remover usuario de la lista
        connectedUsers.delete(socket.id);
        
        console.log(`Usuarios conectados: ${connectedUsers.size}`);
      }
    });

    // Manejar errores del socket
    socket.on("error", (error) => {
      console.error(`Error en socket ${socket.id}:`, error);
    });
  });

  // Estadísticas del servidor (opcional)
  setInterval(() => {
    const stats = {
      connectedUsers: connectedUsers.size,
      oauthUsers: Array.from(connectedUsers.values())
        .filter(user => user.userProfile?.provider).length,
      traditionalUsers: Array.from(connectedUsers.values())
        .filter(user => !user.userProfile?.provider).length
    };
    
    console.log(`📊 Stats: ${stats.connectedUsers} usuarios (OAuth: ${stats.oauthUsers}, Tradicional: ${stats.traditionalUsers})`);
  }, 60000); // Cada minuto

  return io;
};