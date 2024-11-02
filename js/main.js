// Importar Firebase y su configuración
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDp640IDbTZKs06pb6HbTV8MUbK2PxH94I",
    authDomain: "gestion-judicial-db4b3.firebaseapp.com",
    projectId: "gestion-judicial-db4b3",
    storageBucket: "gestion-judicial-db4b3.appspot.com",
    messagingSenderId: "303875022601",
    appId: "1:303875022601:web:2e6b5d64875f76c629bdd8",
    measurementId: "G-37809R39P3"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Obtener los elementos del DOM
const loginForm = document.getElementById('login-form');
const authMessage = document.getElementById('auth-message');

// Función para iniciar sesión
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            authMessage.textContent = `Inicio de sesión exitoso: ${user.email}`;
            loginForm.reset();
            // Redirigir al menú principal
            window.location.href = 'html/menu.html'; // Ajustar la ruta del menú
        })
        .catch((error) => {
            authMessage.textContent = `Error al iniciar sesión: ${error.message}`;
        });
});

