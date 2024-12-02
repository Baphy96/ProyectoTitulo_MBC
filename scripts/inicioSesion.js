import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
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

// Formulario de inicio de sesión
document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

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
                    window.location.href = "./html/menu.html"; // Redirigir al menú del administrador
                    break;
                case "Asistente Administrativo":
                    window.location.href = "./html/gestionCausas.html"; // Redirigir a gestión de causas
                    break;
                case "Abogado":
                    window.location.href = "./html/reportes.html"; // Redirigir a los reportes
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
