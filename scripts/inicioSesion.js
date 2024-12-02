import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    PhoneAuthProvider,
    PhoneMultiFactorGenerator,
    getMultiFactorResolver,
    sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDp640IDbTZKs06pb6HbTV8MUbK2PxH94I",
    authDomain: "gestion-judicial-db4b3.firebaseapp.com",
    projectId: "gestion-judicial-db4b3",
    storageBucket: "gestion-judicial-db4b3.appspot.com",
    messagingSenderId: "303875022601",
    appId: "1:303875022601:web:2e6b5d64875f76c629bdd8",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
console.log("Objeto auth:", auth);

// Función para ejecutar reCAPTCHA Enterprise
async function executeRecaptcha(action) {
    try {
        return await grecaptcha.enterprise.execute("6LdjDY4qAAAAAPyTSMSMQsQ5R_Q0S0iTy1RDIQEz", { action });
    } catch (error) {
        console.error("Error al ejecutar reCAPTCHA:", error.message);
        document.getElementById('auth-message').textContent = "Error al validar reCAPTCHA. Inténtalo de nuevo.";
        return null;
    }
}

// Función para enviar el token y la acción al backend
async function validateRecaptchaBackend(token, action) {
    try {
        const response = await fetch("https://9000-idx-v1-gestion-judicial-1728959158852.cluster-duylic2g3fbzerqpzxxbw6helm.cloudworkstations.dev:3000/verify-recaptcha", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: token, action: action }),
        });

        const result = await response.json();
        if (!result.success) {
            console.error("Validación fallida en el backend:", result.message);
            document.getElementById('auth-message').textContent = "Error en la validación de reCAPTCHA.";
            return false;
        }

        console.log("Validación exitosa en el backend:", result.message);
        return true;
    } catch (error) {
        console.error("Error al validar reCAPTCHA en el backend:", error.message);
        document.getElementById('auth-message').textContent = "Error al comunicarse con el backend.";
        return false;
    }
}

// Flujo MFA
async function handleMultiFactorAuth(error) {
    const resolver = getMultiFactorResolver(auth, error);
    console.log("Resolver recibido:", resolver);

    if (!resolver || !resolver.hints || !resolver.hints.length) {
        console.error("No se pueden obtener los datos de MFA del resolver.");
        document.getElementById('auth-message').textContent = "Error al obtener información de MFA.";
        return;
    }

    // Mostrar la sección de teléfono
    document.getElementById('phone-section').style.display = 'block';

    // Ejecutar reCAPTCHA antes de proceder con MFA
    console.log("Ejecutando reCAPTCHA para acción MFA...");
    const recaptchaToken = await grecaptcha.enterprise.execute("6LdjDY4qAAAAAPyTSMSMQsQ5R_Q0S0iTy1RDIQEz", { action: "MFA" });

    if (!recaptchaToken) {
        console.error("No se pudo generar un token de reCAPTCHA.");
        document.getElementById('auth-message').textContent = "Error al validar reCAPTCHA. Inténtalo de nuevo.";
        return;
    }

    const backendValidated = await validateRecaptchaBackend(recaptchaToken, "MFA");
    if (!backendValidated) return;

    const phoneInfoOptions = {
        multiFactorHint: resolver.hints[0],
        session: resolver.session
    };

    try {
        const phoneAuthProvider = new PhoneAuthProvider(auth);
        const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaToken);
        document.getElementById('phone-section').style.display = 'none';
        document.getElementById('verification-section').style.display = 'block';

        const verificationCode = prompt("Introduce el código SMS enviado a tu teléfono:");
        if (!verificationCode) {
            throw new Error("El código de verificación no puede estar vacío.");
        }

        const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
        const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

        const userCredential = await resolver.resolveSignIn(multiFactorAssertion);
        console.log("Inicio de sesión exitoso con MFA.");
        document.getElementById('auth-message').textContent = "Inicio de sesión exitoso con MFA.";
    } catch (error) {
        console.error("Error durante el flujo MFA:", error.message);
        document.getElementById('auth-message').textContent = `Error en el flujo MFA: ${error.message}`;
        document.getElementById('phone-section').style.display = 'none';
        document.getElementById('verification-section').style.display = 'none';
    }
}

// Manejar inicio de sesión
document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        // Ejecutar reCAPTCHA antes de proceder con el inicio de sesión
        console.log("Ejecutando reCAPTCHA para acción LOGIN...");
        const recaptchaToken = await grecaptcha.enterprise.execute("6LdjDY4qAAAAAPyTSMSMQsQ5R_Q0S0iTy1RDIQEz", { action: "LOGIN" });

        // Agregar este console.log para inspeccionar el token
        console.log("Token generado por reCAPTCHA:", recaptchaToken);

        if (!recaptchaToken) {
            console.error("No se pudo generar un token de reCAPTCHA.");
            document.getElementById('auth-message').textContent = "Error al validar reCAPTCHA. Inténtalo de nuevo.";
            return;
        }

    // Aquí puedes enviar el token al backend para validación
    const backendValidated = await validateRecaptchaBackend(recaptchaToken, "LOGIN");
    if (!backendValidated) return;

    // Proceder con el inicio de sesión en Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
        await sendEmailVerification(user);
        document.getElementById('auth-message').textContent = "Correo no verificado. Revisa tu bandeja de entrada.";
    } else {
        document.getElementById('auth-message').textContent = "Inicio de sesión exitoso.";
        console.log("Inicio de sesión exitoso sin MFA.");
    }
} catch (error) {
    console.error("Error durante el proceso de inicio de sesión:", error.message);
    document.getElementById('auth-message').textContent = `Error: ${error.message}`;
}
});