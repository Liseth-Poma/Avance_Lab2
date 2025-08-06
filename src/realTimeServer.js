module.exports = (httpServer) => {
  const { Server } = require('socket.io');
  const io = new Server(httpServer);

  const users = new Map(); // Mapa para almacenar información de los usuarios

  io.on("connection", (socket) => {
    socket.on("register", (username) => {
      users.set(socket.id, { username, isNewUser: true }); // Guardar información del usuario
      socket.emit("registered", { username, isNewUser: true }); // Enviar información al cliente
    });

    socket.on("message", (message) => {
      const user = users.get(socket.id);
      io.emit("message", {
        user: user.username,
        message,
        isNewUser: user.isNewUser,
      });
      user.isNewUser = false; // Marcar al usuario como no nuevo
    });

    socket.on("disconnect", () => {
      users.delete(socket.id); // Eliminar información del usuario cuando se desconecte
    });
  });
};
