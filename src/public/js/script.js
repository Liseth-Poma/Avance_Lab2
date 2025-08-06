const socket = io();
const send = document.querySelector("#send-message");
const allMessages = document.querySelector("#all-messages");

let username = "";
let isUser1 = false; // Bandera para identificar al primer usuario

// Registrar usuario al conectarse
socket.on("connect", () => {
  const storedUsername = getCookie("username");
  if (storedUsername) {
    username = storedUsername;
    socket.emit("register", username);
  } else {
    document.location.href = "/register.html";
  }
});

// Manejar registro de usuario
socket.on("registered", ({ username, isNewUser }) => {
  console.log(`Usuario ${username} se ha registrado. ¿Es nuevo? ${isNewUser}`);
  isUser1 = isNewUser; // Establecer la bandera de usuario 1
});

// Manejar recepción de mensajes
socket.on("message", ({ user, message }) => {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');

  if (isUser1) {
    messageElement.classList.add('animate__animated', 'animate__fadeInLeft');
  } else {
    messageElement.classList.add('animate__animated', 'animate__fadeInRight');
  }

  messageElement.innerHTML = `
    <div class="image-container">
      <img src="/img/perfil.jpg" alt="${user}'s Avatar">
    </div>
    <div class="message-body ${isUser1 ? 'user1-message' : 'user2-message'}">
      <div class="user-info">
        <span class="username">${user}</span>
        <span class="time">Hace 1 minuto</span>
      </div>
      <p>${message}</p>
    </div>
  `;

  allMessages.appendChild(messageElement);
  allMessages.scrollTop = allMessages.scrollHeight;

  isUser1 = !isUser1; // Alternar la bandera de usuario 1
});

// Enviar mensaje
send.addEventListener("click", () => {
  const message = document.querySelector("#message").value;
  socket.emit("message", message);
  document.querySelector("#message").value = "";
});

// Función auxiliar para obtener la cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Agregar al final de tu script.js existente
async function loadUserProfiles() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    const users = await response.json();
    return users;
  } catch (error) {
    console.error('Error cargando perfiles:', error);
    return [];
  }
}

// Función para obtener datos adicionales del usuario en el chat
async function enrichUserData(username) {
  const users = await loadUserProfiles();
  const userProfile = users.find(user => 
    user.username.toLowerCase() === username.toLowerCase()
  );
  return userProfile || null;
}