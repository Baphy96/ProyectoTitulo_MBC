// Importar Firebase y su configuración
import { auth } from './firebaseconfig.js';

// Obtener los elementos del DOM
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const authMessage = document.getElementById('auth-message');
const forgotPasswordLink = document.querySelector('.forgot-password');

// Manejo de pestañas
document.getElementById('register-tab').addEventListener('click', () => {
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    document.getElementById('register-tab').classList.add('active');
    document.getElementById('login-tab').classList.remove('active');
});

document.getElementById('login-tab').addEventListener('click', () => {
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    document.getElementById('login-tab').classList.add('active');
    document.getElementById('register-tab').classList.remove('active');
});

// Función para registrar un nuevo usuario
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    // Crear un nuevo usuario en Firebase
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            authMessage.textContent = `Usuario registrado exitosamente: ${user.email}`;
            registerForm.reset();
        })
        .catch((error) => {
            authMessage.textContent = `Error al registrar: ${error.message}`;
        });
});

// Función para iniciar sesión
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            authMessage.textContent = `Inicio de sesión exitoso: ${user.email}`;
            loginForm.reset();
            // Redirigir al menú principal
            window.location.href = 'html/mnu.html';
        })
        .catch((error) => {
            authMessage.textContent = `Error al iniciar sesión: ${error.message}`;
        });
});

// Recuperación de contraseña
forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;

    auth.sendPasswordResetEmail(email)
        .then(() => {
            authMessage.textContent = 'Se ha enviado un enlace de restablecimiento a tu correo.';
        })
        .catch((error) => {
            authMessage.textContent = `Error: ${error.message}`;
        });
});
