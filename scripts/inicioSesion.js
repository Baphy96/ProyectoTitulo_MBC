import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, updatePassword } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { checkUserRole } from './roleManager.js';

// Configuración de Firebase
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
const auth = getAuth(app);
const db = getFirestore(app);


// Validar si la contraseña es robusta
function esContraseñaRobusta(contraseña) {
    const longitudMinima = 8;
    const tieneMayuscula = /[A-Z]/.test(contraseña);
    const tieneMinuscula = /[a-z]/.test(contraseña);
    const tieneNumero = /\d/.test(contraseña);
    const tieneCaracterEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(contraseña);

    return (
        contraseña.length >= longitudMinima &&
        tieneMayuscula &&
        tieneMinuscula &&
        tieneNumero &&
        tieneCaracterEspecial
    );
}

// Formulario de inicio de sesión
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;

            // Verificar si la contraseña es robusta
            if (!esContraseñaRobusta(password)) {
                document.getElementById("auth-message").textContent = "La contraseña no es lo suficientemente segura. Debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un carácter especial.";
                return;
            }

            try {
                // Realizar el inicio de sesión
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user; // Obtener el usuario autenticado

                // Verificar si el correo está verificado
                if (!user.emailVerified) {
                    await sendEmailVerification(user);
                    document.getElementById("auth-message").textContent = "Correo no verificado. Revisa tu bandeja de entrada.";
                    return;
                }

                // Obtener información del usuario desde Firestore
                const userDoc = await getDoc(doc(db, "usuarios", user.uid));
                console.log("Resultado de la consulta:", userDoc.exists(), userDoc.data());
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const role = userData.role;  // El campo 'role' es el que debe determinar el acceso

                    // Guardar el rol en localStorage
                    localStorage.setItem('userRole', role);
                    checkUserRole();  // Verificar el rol ahora que ha sido almacenado

                    // Redirigir según el rol
                    switch (role) {
                        case "Administrador":
                        case "Asistente Administrativo":
                        case "Abogado":
                            window.location.href = "./html/menu.html"; // Redirigir al menú
                            break;
                        default:
                            console.error("Rol desconocido:", role);
                            document.getElementById("auth-message").textContent = "Rol desconocido.";
                            break;
                    }
                } else {
                    console.error("No se encontró información del usuario en Firestore.");
                    document.getElementById("auth-message").textContent = "No se encontró información del usuario.";
                }
            } catch (error) {
                console.error("Error durante el inicio de sesión o acceso a Firestore:", error.message);
                document.getElementById("auth-message").textContent = `Error: ${error.message}`;
            }
        });
    }

    // Enlace para restablecer contraseña
    const resetPasswordLink = document.getElementById("reset-password-link");
    if (resetPasswordLink) {
        resetPasswordLink.addEventListener("click", async () => {
            const email = document.getElementById("login-email").value;

            if (!email) {
                document.getElementById("auth-message").textContent = "Por favor, ingresa tu correo electrónico para restablecer tu contraseña.";
                return;
            }

            try {
                await sendPasswordResetEmail(auth, email);
                document.getElementById("auth-message").textContent = "Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico.";
            } catch (error) {
                console.error("Error al enviar el correo de restablecimiento:", error);
                document.getElementById("auth-message").textContent = `Error: ${error.message}`;
            }
        });
    }

    // Actualizar contraseña después de restablecerla
    const updatePasswordForm = document.getElementById("update-password-form");
    if (updatePasswordForm) {
        updatePasswordForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const newPassword = document.getElementById("new-password").value;

            // Verificar si la nueva contraseña es robusta
            if (!esContraseñaRobusta(newPassword)) {
                document.getElementById("auth-message").textContent = "La nueva contraseña no es lo suficientemente segura. Debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un carácter especial.";
                return;
            }

            try {
                const user = auth.currentUser;
                if (user) {
                    await updatePassword(user, newPassword);
                    document.getElementById("auth-message").textContent = "Tu contraseña ha sido actualizada exitosamente.";
                } else {
                    document.getElementById("auth-message").textContent = "No se ha podido autenticar al usuario. Por favor, inicia sesión nuevamente.";
                }
            } catch (error) {
                console.error("Error al actualizar la contraseña:", error);
                document.getElementById("auth-message").textContent = `Error: ${error.message}`;
            }
        });
    }
});
