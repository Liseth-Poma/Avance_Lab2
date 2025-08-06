const socket = io();
const registerForm = document.querySelector("#register-form");

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = document.querySelector("#username").value;
  socket.emit("register", username);
  setCookie("username", username, 7); // Guardar el nombre de usuario en una cookie
  document.location.href = "/"; // Redirigir al usuario al chat
});

function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}