# Implementación de Autenticación OAuth 2.0 en Sistema de Chat Web en Tiempo Real

**Estudiante:** Liseth Carolina Poma Lagos

## RESUMEN

Este informe presenta la implementación exitosa de un sistema de autenticación OAuth 2.0 integrado en una aplicación de chat web en tiempo real. El proyecto incorpora autenticación con Google OAuth 2.0 utilizando Passport.js, manteniendo la compatibilidad con el sistema de registro tradicional existente. Se desarrolló una arquitectura robusta que combina WebSockets para comunicación en tiempo real, JWT para manejo de sesiones seguro, y una interfaz de usuario moderna con Bootstrap. La implementación permite a los usuarios autenticarse de manera segura utilizando sus cuentas de Google, obteniendo acceso inmediato al sistema de chat con información de perfil enriquecida incluyendo avatares y datos del proveedor OAuth. Los resultados demuestran un sistema funcional que mejora significativamente la experiencia de usuario al eliminar la fricción del registro manual, mientras mantiene altos estándares de seguridad mediante tokens JWT y validación de sesiones.

**Palabras Claves:** OAuth 2.0, WebSockets, JWT

## 1. INTRODUCCIÓN

La autenticación OAuth 2.0 se ha convertido en el estándar de facto para permitir que las aplicaciones accedan de manera segura a recursos de terceros sin comprometer las credenciales del usuario. En el contexto de aplicaciones de chat web, la implementación de OAuth mejora significativamente la experiencia del usuario al reducir las barreras de entrada y proporcionar un método de autenticación confiable y familiar.

Este proyecto tiene como finalidad integrar un sistema de autenticación OAuth 2.0 en una aplicación de chat web existente, manteniendo la funcionalidad de tiempo real mediante WebSockets y asegurando la compatibilidad con el sistema de autenticación tradicional previamente implementado.

## 2. OBJETIVO(S)

**2.1 Objetivo Principal**
- Implementar un sistema de autenticación OAuth 2.0 completamente funcional utilizando Google como proveedor de identidad en una aplicación de chat web en tiempo real.

**2.2 Objetivos Específicos**
- Configurar Passport.js para manejar la autenticación OAuth 2.0 con Google
- Integrar JWT (JSON Web Tokens) para el manejo seguro de sesiones
- Mantener la compatibilidad con el sistema de autenticación tradicional existente
- Desarrollar una interfaz de usuario moderna para el proceso de login OAuth
- Implementar middleware de autenticación para proteger rutas sensibles
- Asegurar la comunicación en tiempo real mediante WebSockets con usuarios autenticados

## 3. MARCO TEÓRICO

### OAuth 2.0
OAuth 2.0 es un protocolo de autorización que permite a las aplicaciones obtener acceso limitado a cuentas de usuario en un servicio HTTP. Funciona delegando la autenticación del usuario al servicio que hospeda la cuenta del usuario, y autorizando a aplicaciones de terceros a acceder a la cuenta del usuario.

### JSON Web Tokens (JWT)
JWT es un estándar abierto (RFC 7519) que define una forma compacta y auto-contenida para transmitir información de manera segura entre partes como un objeto JSON. Esta información puede ser verificada y confiable porque está firmada digitalmente.

### Passport.js
Passport es un middleware de autenticación para Node.js que es extremadamente flexible y modular. Puede ser discretamente integrado en cualquier aplicación web basada en Express, y soporta un conjunto completo de estrategias para autenticar usando un nombre de usuario y contraseña, Facebook, Twitter, Google, y más.

### WebSockets
WebSockets proporcionan un canal de comunicación full-duplex sobre una conexión TCP única, permitiendo la comunicación en tiempo real entre el cliente y el servidor.

## 4. DESCRIPCIÓN DEL PROCEDIMIENTO

### 4.1 Materiales y Tecnologías Utilizadas
- **Node.js**: Entorno de ejecución para JavaScript
- **Express.js**: Framework web para Node.js
- **Passport.js**: Middleware de autenticación
- **passport-google-oauth20**: Estrategia OAuth 2.0 para Google
- **jsonwebtoken**: Librería para manejo de JWT
- **Socket.io**: Librería para WebSockets
- **Bootstrap**: Framework CSS para interfaz de usuario
- **Google Cloud Console**: Para configuración OAuth

### 4.2 Configuración del Entorno
```bash
# Instalación de dependencias
npm install passport passport-google-oauth20 jsonwebtoken express-session cors dotenv

# Variables de entorno requeridas
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=clave-secreta-jwt
SESSION_SECRET=clave-secreta-session
GOOGLE_CLIENT_ID=client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=client-secret
```

### 4.3 Configuración OAuth en Google Cloud Console
1. Creación de proyecto en Google Cloud Console
2. Habilitación de Google+ API
3. Configuración de credenciales OAuth 2.0:
   - Tipo: Aplicación web
   - URIs de origen: `http://localhost:3000`
   - URIs de redirección: `http://localhost:3000/auth/google/callback`

### 4.4 Implementación del Sistema

**Configuración de Passport (src/config/passport.js)**
- Estrategia Google OAuth 2.0
- Manejo de usuarios en memoria
- Generación de JWT tokens

**Middleware de Autenticación (src/middlewares/isLoggedIn.js)**
- Verificación de cookies tradicionales
- Validación de JWT tokens
- Compatibilidad con ambos métodos de autenticación

**Rutas de Autenticación (src/routes/auth.js)**
- `/auth/google`: Inicio de autenticación
- `/auth/google/callback`: Callback de Google
- `/auth/me`: Información del usuario
- `/auth/logout`: Cierre de sesión

## 5. ANÁLISIS DE RESULTADOS

### 5.1 Flujo de Autenticación Implementado

El sistema implementado sigue el siguiente flujo:

1. **Inicio de Sesión**: Usuario accede a `/login` y selecciona "Continuar con Google"

![Página de Login](https://imgur.com/XDU4k4E.png)

2. **Selección de Cuenta**: Google presenta las cuentas disponibles para autenticación

![Selección de Cuenta Google](https://imgur.com/HmxEglK.png)

3. **Autorización**: Usuario otorga permisos a la aplicación

![Permisos de Acceso](https://imgur.com/8vv5rC5.png)

4. **Procesamiento**: El servidor procesa la respuesta y registra al usuario

![Información de Usuario en Terminal](https://imgur.com/ZWduVle.png)

5. **Acceso al Chat**: Redirección exitosa al sistema de chat

![Acceso Exitoso al Chat](https://imgur.com/tVlJOQZ.png)

### 5.2 Funcionalidad del Chat en Tiempo Real

El sistema mantiene toda la funcionalidad de chat en tiempo real:

![Interacción en el Chat](https://imgur.com/GmSfFYA.png)

### 5.3 Soporte Multi-Usuario

El sistema soporta múltiples usuarios simultáneos con información OAuth enriquecida:

![Chat Multi-Usuario OAuth](https://imgur.com/dtFIgrM.png)

### 5.4 API de Usuario Autenticado

Implementación de endpoint `/auth/me` para obtener información del usuario:

![Endpoint /auth/me](https://imgur.com/Wkm1DcF.png)

### 5.5 Vista de Perfil Completo

Desarrollo de interfaz para visualización del perfil completo del usuario:

![Vista de Perfil Completo](https://imgur.com/O4Fg6aU.png)

### 5.6 Métricas del Sistema

| Característica | Estado | Descripción |
|----------------|---------|-------------|
| Autenticación OAuth | ✅ | Totalmente funcional |
| Compatibilidad Tradicional | ✅ | Mantiene registro manual |
| Chat Tiempo Real | ✅ | WebSockets operativos |
| Información Enriquecida | ✅ | Perfiles con avatares |
| Seguridad JWT | ✅ | Tokens seguros implementados |


## 6. DISCUSIÓN

La implementación de OAuth 2.0 en el sistema de chat web demuestra varias ventajas significativas sobre los métodos de autenticación tradicionales:

**Ventajas Observadas:**
- **Reducción de Fricción**: Los usuarios pueden acceder inmediatamente sin crear nuevas credenciales
- **Seguridad Mejorada**: Delegación de autenticación a proveedores confiables como Google
- **Información Enriquecida**: Acceso a avatares y datos de perfil del proveedor OAuth
- **Experiencia Familiar**: Los usuarios están familiarizados con el proceso de OAuth de Google

**Desafíos Técnicos Resueltos:**
- **Compatibilidad Dual**: Mantenimiento del sistema de registro tradicional junto con OAuth
- **Manejo de Sesiones**: Implementación de JWT para sesiones seguras y escalables
- **Integración WebSocket**: Autenticación de conexiones Socket.io con tokens JWT
- **Middleware Robusto**: Verificación de autenticación en múltiples formatos (cookies tradicionales y JWT)

**Consideraciones de Seguridad:**
El sistema implementa múltiples capas de seguridad incluyendo validación de tokens JWT, verificación de origen de cookies, y manejo seguro de sesiones Express.

## 7. CONCLUSIONES

1. **Éxito en la Implementación**: Se logró integrar exitosamente OAuth 2.0 con Google manteniendo la funcionalidad completa del chat en tiempo real.

2. **Compatibilidad Preservada**: El sistema mantiene la compatibilidad con el método de autenticación tradicional, permitiendo una transición gradual de usuarios.

3. **Mejora en UX**: La implementación de OAuth reduce significativamente las barreras de entrada para nuevos usuarios, mejorando la adopción del sistema.

4. **Seguridad Robusta**: La combinación de OAuth 2.0 con JWT proporciona un sistema de autenticación seguro y escalable.

5. **Arquitectura Extensible**: La implementación permite fácilmente agregar nuevos proveedores OAuth (GitHub, Facebook, etc.) siguiendo el mismo patrón.

6. **Funcionalidad Completa**: Todas las características del chat original (tiempo real, multi-usuario, interfaz moderna) se mantienen operativas con la nueva autenticación.

El proyecto demuestra que es posible integrar sistemas de autenticación modernos en aplicaciones existentes sin comprometer la funcionalidad o la experiencia del usuario, estableciendo una base sólida para futuras expansiones del sistema.

## 8. BIBLIOGRAFÍA

**OAuth Working Group.** 2012. *The OAuth 2.0 Authorization Framework*, RFC 6749, Internet Engineering Task Force. https://tools.ietf.org/html/rfc6749. Consultado: Diciembre 2024.

**Jones, M., Bradley, J., Sakimura, N.** 2015. *JSON Web Token (JWT)*, RFC 7519, Internet Engineering Task Force. https://tools.ietf.org/html/rfc7519. Consultado: Diciembre 2024.

**Passport.js Contributors.** 2024. *Passport.js Documentation*, Passport.js Official Documentation. http://www.passportjs.org/docs/. Consultado: Diciembre 2024.

**Google Developers.** 2024. *Google OAuth 2.0 Documentation*, Google Identity Platform. https://developers.google.com/identity/protocols/oauth2. Consultado: Diciembre 2024.

**Socket.IO Contributors.** 2024. *Socket.IO Documentation*, Socket.IO Official Documentation. https://socket.io/docs/. Consultado: Diciembre 2024.
