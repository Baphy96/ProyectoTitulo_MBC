// Obtener elementos del DOM
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const authMessage = document.getElementById('auth-message');
const forgotPasswordLink = document.querySelector('.forgot-password'); // Añadir enlace de recuperación

// Referencia a Firebase Authentication
const auth = firebase.auth();

let intentosFallidos = 0; // Contador de intentos fallidos
const MAX_INTENTOS = 5; // Número máximo de intentos

// Función para validar la contraseña
function validarContrasena(contrasena) {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/;
    return regex.test(contrasena);
}

// Función para registrar un nuevo usuario
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    // Validar la contraseña
    if (!validarContrasena(password)) {
        authMessage.textContent = 'La contraseña debe contener al menos 5 caracteres, incluyendo letras, números y caracteres especiales.';
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            authMessage.textContent = `Usuario registrado exitosamente: ${user.email}`;
            registerForm.reset();
        })
        .catch((error) => {
            if (error.code === 'auth/email-already-in-use') {
                authMessage.textContent = 'Este correo ya está registrado. Por favor, elige otro.';
            } else {
                authMessage.textContent = `Error al registrar el usuario: ${error.message}`;
            }
        });
});

// Función para iniciar sesión
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (intentosFallidos >= MAX_INTENTOS) {
        authMessage.textContent = 'Tu cuenta ha sido bloqueada temporalmente por múltiples intentos fallidos. Intenta más tarde.';
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            intentosFallidos = 0; // Reinicia el contador de intentos fallidos
            const user = userCredential.user;
            authMessage.textContent = `Inicio de sesión exitoso: ${user.email}`;
            loginForm.reset();
            // Aquí puedes redirigir al usuario a otra página o cargar el contenido principal
        })
        .catch((error) => {
            intentosFallidos++;
            authMessage.textContent = `Error al iniciar sesión: ${error.message}`;
            if (intentosFallidos >= MAX_INTENTOS) {
                authMessage.textContent = 'Tu cuenta ha sido bloqueada temporalmente por múltiples intentos fallidos.';
                // Aquí puedes enviar una notificación al usuario
            }
        });
});

// Monitorear el estado de autenticación
auth.onAuthStateChanged((user) => {
    if (user) {
        // Usuario ha iniciado sesión
        console.log(`Usuario autenticado: ${user.email}`);
        document.getElementById('auth-container').style.display = 'none'; // Ocultar el formulario de autenticación
        document.getElementById('welcome-screen').style.display = 'block'; // Mostrar la pantalla de bienvenida
    } else {
        // Usuario no ha iniciado sesión
        console.log('No hay ningún usuario autenticado');
        document.getElementById('auth-container').style.display = 'block'; // Mostrar el formulario de autenticación
    }
});

function cerrarSesion() {
    auth.signOut()
        .then(() => {
            console.log('Cierre de sesión exitoso');
            // Redirigir al usuario a la página de inicio de sesión
        })
        .catch((error) => {
            console.error('Error al cerrar sesión:', error.message);
        });
}

// Recuperación de contraseña
forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;

    auth.sendPasswordResetEmail(email)
        .then(() => {
            authMessage.textContent = 'Se ha enviado un enlace de restablecimiento a tu correo electrónico.';
        })
        .catch((error) => {
            authMessage.textContent = `Error: ${error.message}`;
        });
});

// JavaScript para manejar las pestañas de Registro e Inicio de Sesión
document.getElementById('register-tab').addEventListener('click', function () {
    document.getElementById('register-form').classList.add('active');
    document.getElementById('login-form').classList.remove('active');
    this.classList.add('active');
    document.getElementById('login-tab').classList.remove('active');
});

document.getElementById('login-tab').addEventListener('click', function () {
    document.getElementById('login-form').classList.add('active');
    document.getElementById('register-form').classList.remove('active');
    this.classList.add('active');
    document.getElementById('register-tab').classList.remove('active');
});

