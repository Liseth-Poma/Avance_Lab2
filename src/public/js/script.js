// src/public/js/script.js - Versión Final Mejorada
const socket = io();
const send = document.querySelector("#send-message");
const allMessages = document.querySelector("#all-messages");
const messageInput = document.querySelector("#message");

let username = "";
let userProfile = null;
let isUser1 = false;
let isTyping = false;
let typingTimeout;

// Función para obtener información del usuario autenticado
async function getUserProfile() {
    const token = getCookie('jwt');
    if (token) {
        try {
            const response = await fetch('/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                userProfile = data.user;
                console.log('✅ Perfil de usuario cargado:', userProfile);
                return userProfile;
            }
        } catch (error) {
            console.error('❌ Error obteniendo perfil del usuario:', error);
        }
    }
    return null;
}

// Mostrar información del usuario en la interfaz
function displayUserInfo() {
    if (userProfile) {
        // Crear un header con la información del usuario
        const chatHeader = document.querySelector('.chat-header');
        if (chatHeader && !document.querySelector('.user-info')) {
            const userInfo = document.createElement('div');
            userInfo.className = 'user-info d-flex align-items-center justify-content-between';
            userInfo.innerHTML = `
                <div class="d-flex align-items-center">
                    <div class="user-avatar me-3 position-relative">
                        ${userProfile.avatar ? 
                            `<img src="${userProfile.avatar}" alt="Avatar" class="rounded-circle" style="width: 50px; height: 50px; border: 3px solid rgba(255,255,255,0.4); object-fit: cover;" onerror="this.src='/img/perfil.jpg'">` : 
                            `<div class="rounded-circle bg-light d-flex align-items-center justify-content-center" style="width: 50px; height: 50px; border: 3px solid rgba(255,255,255,0.4);">
                                <i class="fas fa-user text-secondary"></i>
                            </div>`
                        }
                        <div class="position-absolute bottom-0 end-0 online-indicator rounded-circle" style="width: 16px; height: 16px; border: 2px solid white;"></div>
                    </div>
                    <div class="user-details">
                        <div class="user-connection-status">
                            <small class="d-block text-light opacity-75 mb-1">
                                <i class="fas fa-circle text-success me-1" style="font-size: 8px;"></i>
                                Conectado como:
                            </small>
                        </div>
                        <div class="user-name-info mb-1">
                            <strong class="text-white" style="font-size: 1.1rem;">${userProfile.name || 'Usuario'}</strong>
                            ${userProfile.provider ? `<span class="badge bg-success ms-2 px-2 py-1" style="font-size: 0.7rem;"><i class="fab fa-${userProfile.provider} me-1"></i>${userProfile.provider.toUpperCase()}</span>` : ''}
                        </div>
                        <div class="user-email-info">
                            <small class="text-light opacity-75">
                                <i class="fas fa-envelope me-1"></i>
                                ${userProfile.email || 'Sin email'}
                            </small>
                        </div>
                    </div>
                </div>
                <div class="user-actions">
                    <button onclick="showUserProfile()" class="btn btn-outline-light btn-sm me-2" title="Ver perfil completo">
                        <i class="fas fa-user"></i>
                    </button>
                    <button onclick="logout()" class="btn btn-outline-light btn-sm" title="Cerrar sesión">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            `;
            chatHeader.appendChild(userInfo);
            
            // Limpiar el mensaje de bienvenida inicial
            const welcomeMsg = allMessages.querySelector('.text-center.text-muted.py-4');
            if (welcomeMsg) {
                welcomeMsg.style.display = 'none';
            }
        }
    }
}

// Función para mostrar modal de perfil de usuario
function showUserProfile() {
    if (!userProfile) return;
    
    // Crear modal si no existe
    if (!document.getElementById('userProfileModal')) {
        const modalHTML = `
            <div class="modal fade" id="userProfileModal" tabindex="-1" aria-labelledby="userProfileModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="userProfileModalLabel">
                                <i class="fas fa-user-circle me-2"></i>Mi Perfil Completo
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center mb-4">
                                <div class="profile-avatar-container position-relative d-inline-block">
                                    <img src="${userProfile.avatar || '/img/perfil.jpg'}" 
                                         alt="Avatar" class="rounded-circle mb-3" 
                                         style="width: 120px; height: 120px; border: 4px solid #1836dbff; object-fit: cover;"
                                         onerror="this.src='/img/perfil.jpg'">
                                    <div class="position-absolute bottom-0 end-0 online-indicator rounded-circle p-2" 
                                         style="width: 28px; height: 28px; border: 3px solid white;" title="En línea">
                                    </div>
                                </div>
                                <h4 class="mb-1">${userProfile.name || 'Usuario'}</h4>
                                <p class="text-muted mb-0">
                                    <i class="fas fa-envelope me-1"></i>
                                    ${userProfile.email || 'Sin email disponible'}
                                </p>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="profile-info">
                                        <div class="row mb-3">
                                            <div class="col-5 text-muted">
                                                <i class="fas fa-id-card me-2"></i>ID:
                                            </div>
                                            <div class="col-7">
                                                <code class="small">${userProfile.id || 'N/A'}</code>
                                            </div>
                                        </div>
                                        
                                        <div class="row mb-3">
                                            <div class="col-5 text-muted">
                                                <i class="fas fa-shield-alt me-2"></i>Proveedor:
                                            </div>
                                            <div class="col-7">
                                                <span class="badge bg-success px-3 py-2">
                                                    <i class="fab fa-${userProfile.provider || 'user'} me-1"></i>
                                                    ${userProfile.provider ? userProfile.provider.toUpperCase() : 'LOCAL'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div class="row mb-3">
                                            <div class="col-5 text-muted">
                                                <i class="fas fa-calendar-plus me-2"></i>Registrado:
                                            </div>
                                            <div class="col-7">
                                                <small>
                                                    ${userProfile.createdAt ? 
                                                      new Date(userProfile.createdAt).toLocaleDateString('es-ES', {
                                                          year: 'numeric',
                                                          month: 'long', 
                                                          day: 'numeric'
                                                      }) : 
                                                      'No disponible'
                                                    }
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="profile-info">
                                        <div class="row mb-3">
                                            <div class="col-5 text-muted">
                                                <i class="fas fa-clock me-2"></i>Última conexión:
                                            </div>
                                            <div class="col-7">
                                                <small>
                                                    ${userProfile.lastLogin ? 
                                                      new Date(userProfile.lastLogin).toLocaleDateString('es-ES', {
                                                          year: 'numeric',
                                                          month: 'short', 
                                                          day: 'numeric',
                                                          hour: '2-digit',
                                                          minute: '2-digit'
                                                      }) : 
                                                      'Ahora mismo'
                                                    }
                                                </small>
                                            </div>
                                        </div>
                                        
                                        <div class="row mb-3">
                                            <div class="col-5 text-muted">
                                                <i class="fas fa-comments me-2"></i>Estado:
                                            </div>
                                            <div class="col-7">
                                                <span class="badge bg-success">
                                                    <i class="fas fa-circle me-1"></i>En línea
                                                </span>
                                            </div>
                                        </div>
                                        
                                        ${userProfile.provider ? `
                                        <div class="row mb-3">
                                            <div class="col-5 text-muted">
                                                <i class="fab fa-${userProfile.provider} me-2"></i>Perfil ${userProfile.provider}:
                                            </div>
                                            <div class="col-7">
                                                <a href="${userProfile.provider === 'google' ? 'https://myaccount.google.com' : 'https://github.com/' + (userProfile.username || '')}" 
                                                   target="_blank" class="btn btn-sm btn-outline-primary">
                                                    Ver perfil <i class="fas fa-external-link-alt ms-1"></i>
                                                </a>
                                            </div>
                                        </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-1"></i>Cerrar
                            </button>
                            <button type="button" class="btn btn-danger" onclick="confirmLogout()">
                                <i class="fas fa-sign-out-alt me-1"></i>Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('userProfileModal'));
    modal.show();
}

// Función para confirmar logout
function confirmLogout() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('userProfileModal'));
    if (modal) {
        modal.hide();
    }
    
    setTimeout(() => {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            logout();
        }
    }, 300);
}

// Función de logout mejorada
async function logout() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('d-none');
    }
    
    try {
        const response = await fetch('/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            // Limpiar cookies localmente también
            document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            
            showToast('Sesión cerrada exitosamente', 'success');
            
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
        }
    } catch (error) {
        console.error('Error en logout:', error);
        showToast('Error al cerrar sesión', 'error');
        window.location.href = '/login';
    } finally {
        if (loadingOverlay) {
            loadingOverlay.classList.add('d-none');
        }
    }
}

// Registrar usuario al conectarse
socket.on("connect", async () => {
    console.log('🔌 Conectado al servidor Socket.IO');
    
    // Verificar parámetro de éxito en URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
        window.history.replaceState({}, document.title, window.location.pathname);
        showToast('¡Autenticación OAuth exitosa!', 'success');
    }
    
    // Obtener perfil del usuario
    await getUserProfile();
    
    // Usar información OAuth o fallback al método tradicional
    const storedUsername = getCookie("username");
    if (storedUsername) {
        username = storedUsername;
        socket.emit("register", {
            username: username,
            userProfile: userProfile
        });
        
        // Mostrar información del usuario en la interfaz
        displayUserInfo();
        
        console.log('👤 Usuario registrado:', username);
    } else {
        console.error('❌ No se encontró nombre de usuario');
        showToast('Error de autenticación. Redirigiendo...', 'error');
        setTimeout(() => {
            window.location.href = "/login";
        }, 2000);
    }
});

// Manejar registro de usuario
socket.on("registered", ({ username: regUsername, isNewUser, userProfile: serverProfile }) => {
    console.log(`✅ Usuario ${regUsername} registrado. Nuevo: ${isNewUser}`);
    isUser1 = isNewUser;
    
    // Si el servidor devuelve información del perfil, usarla
    if (serverProfile) {
        userProfile = { ...userProfile, ...serverProfile };
        displayUserInfo();
    }
    
    // Mostrar mensaje de bienvenida si es un nuevo usuario OAuth
    if (isNewUser && userProfile && userProfile.provider) {
        const welcomeMessage = `
            <div class="alert welcome-message alert-dismissible fade show m-3 animate__animated animate__bounceInDown" role="alert">
                <div class="d-flex align-items-center">
                    <img src="${userProfile.avatar}" alt="Avatar" class="rounded-circle me-3" style="width: 50px; height: 50px; object-fit: cover;" onerror="this.src='/img/perfil.jpg'">
                    <div>
                        <h6 class="mb-1">¡Bienvenido/a ${userProfile.name}! 🎉</h6>
                        <small>Te has conectado exitosamente con <strong>${userProfile.provider.toUpperCase()}</strong> (${userProfile.email})</small>
                    </div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        document.body.insertAdjacentHTML('afterbegin', welcomeMessage);
        
        // Auto-dismiss después de 8 segundos
        setTimeout(() => {
            const alert = document.querySelector('.welcome-message');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 8000);
    }
});

// Manejar recepción de mensajes mejorada
socket.on("message", ({ user, message, userProfile: senderProfile, timestamp }) => {
    // Remover indicador de typing si existe
    removeTypingIndicator();
    
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    // Determinar si es el usuario actual
    const isCurrentUser = user === username;
    const animationClass = isCurrentUser ? 'animate__fadeInRight' : 'animate__fadeInLeft';
    const messageClass = isCurrentUser ? 'user2-message' : 'user1-message';
    const messageAlign = isCurrentUser ? 'justify-content-end' : 'justify-content-start';
    
    messageElement.classList.ad    
        messageElement.classList.add(animationClass, messageClass, 'd-flex', messageAlign, 'mb-2', 'animate__animated');
    
        // Avatar y nombre del usuario que envía el mensaje
        const avatarUrl = senderProfile && senderProfile.avatar ? senderProfile.avatar : '/img/perfil.jpg';
        const senderName = senderProfile && senderProfile.name ? senderProfile.name : user;
    
        messageElement.innerHTML = `
            <div class="d-flex align-items-end ${isCurrentUser ? 'flex-row-reverse' : ''}">
                <div class="chat-avatar me-2 ${isCurrentUser ? 'ms-2 me-0' : ''}">
                    <img src="${avatarUrl}" alt="Avatar" class="rounded-circle" style="width: 36px; height: 36px; object-fit: cover;" onerror="this.src='/img/perfil.jpg'">
                </div>
               <div class="chat-bubble px-3 py-2 rounded-3 position-relative"
     style="${isCurrentUser 
        ? 'background-color: #d0e7ff; color: #000;' 
        : 'background-color: #adcab7ff; color: #212529;'}">

                    <div class="chat-sender mb-1">
                        <small class="fw-bold ${isCurrentUser ? 'text-black' : 'text-black'}">${senderName}</small>
                    </div>
                    <div class="chat-message-content">
                        ${message}
                    </div>
                    <div class="chat-timestamp text-end mt-1">
                        <small class="text-muted" style="font-size: 0.75rem;">
                            ${timestamp ? new Date(timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </small>
                    </div>
                </div>
            </div>
        `;
    
        allMessages.appendChild(messageElement);
        allMessages.scrollTop = allMessages.scrollHeight;
});

// Manejar typing
socket.on("typing", ({ user, isTyping }) => {
    if (user === username) return; // No mostrar el propio typing

    if (isTyping) {
        showTypingIndicator(user);
    } else {
        removeTypingIndicator();
    }
});

function showTypingIndicator(user) {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (!typingIndicator) {
        const newIndicator = document.createElement('div');
        newIndicator.className = 'typing-indicator text-muted small';
        newIndicator.innerHTML = `<i class="fas fa-spinner fa-spin me-1"></i>${user} está escribiendo...`;
        allMessages.appendChild(newIndicator);
    } else {
        typingIndicator.innerHTML = `<i class="fas fa-spinner fa-spin me-1"></i>${user} está escribiendo...`;
    }
}

function removeTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}
// Manejar envío de mensajes
send.addEventListener("click", () => {
    const message = messageInput.value.trim();
    if (!message) return;

    // Limpiar el campo de entrada
    messageInput.value = '';
    
    // Enviar mensaje al servidor
    socket.emit("message", {
        message: message,
        userProfile: userProfile,
        timestamp: new Date().toISOString()
    });
});
    // Manejar enter para enviar mensaje
messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        send.click();
    } else if (event.key === "Enter") {
        // Enviar typing solo si no se está enviando un mensaje
        if (!isTyping) {
            isTyping = true;
            socket.emit("typing", { user: username, isTyping: true });
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                isTyping = false;
                socket.emit("typing", { user: username, isTyping: false });
            }, 3000); // Dejar de escribir después de 3 segundos
        }
    }
}   );
// Función para obtener el valor de una cookie por su nombre
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}
// Mostrar notificaciones
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerText = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}   