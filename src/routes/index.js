// src/routes/index.js - Actualizado con nuevas rutas OAuth
const express = require("express");
const router = express.Router();
const path = require("path");

const views = path.join(__dirname, "/../views");

const isLoggedIn = require("../middlewares/isLoggedIn");

// Ruta principal del chat - requiere autenticación
router.get("/", isLoggedIn, (req, res) => {
  res.sendFile(views + "/index.html");
});

// Ruta de login OAuth (reemplaza la de registro tradicional)
router.get("/login", (req, res) => {
  res.sendFile(views + "/login.html");
});

// Mantener ruta de registro tradicional para compatibilidad
router.get("/register", (req, res) => {
  res.sendFile(views + "/register.html");
});

// Gestión de API - requiere autenticación
router.get("/api-manager", isLoggedIn, (req, res) => {
  res.sendFile(views + "/api-manager.html");
});

// Ruta para cerrar sesión
router.get("/logout", (req, res) => {
  res.clearCookie('username');
  res.clearCookie('jwt');
  res.redirect('/login');
});

module.exports = router;