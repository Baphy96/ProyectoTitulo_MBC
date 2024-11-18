// Importar módulos de Firebase
//import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
//import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";


import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";


// Configuración de Firebase
export const firebaseConfig = {
    apiKey: "AIzaSyDp640IDbTZKs06pb6HbTV8MUbK2PxH94I",
    authDomain: "gestion-judicial-db4b3.firebaseapp.com",
    projectId: "gestion-judicial-db4b3",
    storageBucket: "gestion-judicial-db4b3.appspot.com",
    messagingSenderId: "303875022601",
    appId: "1:303875022601:web:2e6b5d64875f76c629bdd8",
    measurementId: "G-37809R39P3"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Exportar las instancias de Firebase
export { app, auth, db };

