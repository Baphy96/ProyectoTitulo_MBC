import express from 'express';
import { GoogleAuth } from 'google-auth-library';
import fetch from 'node-fetch';
import cors from 'cors'; // Importar CORS para manejar solicitudes cruzadas
import admin from 'firebase-admin'; // Importar Firebase Admin SDK
import serviceAccount from './keys/gestion-judicial-db4b3-30786297339e.json' assert { type: 'json' }; // Importación con assert JSON

const app = express();
const port = process.env.PORT || 3000; // Soporte para puerto en entornos de producción

// Configuración de CORS
const allowedOrigins = [
    'http://localhost:3000',
    'https://9000-idx-v1-gestion-judicial-1728959158852.cluster-duylic2g3fbzerqpzxxbw6helm.cloudworkstations.dev',
];
app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware para manejar JSON
app.use(express.json());

// Inicializar Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://gestion-judicial-db4b3.firebaseio.com", // Opcional si usas Firestore
});
const db = admin.firestore(); // Inicializa Firestore

// Ruta principal de prueba
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

// Función para validar reCAPTCHA
async function validateRecaptcha(token, action) {
    try {
        const auth = new GoogleAuth({
            keyFilename: './keys/gestion-judicial-db4b3-30786297339e.json',
            scopes: 'https://www.googleapis.com/auth/cloud-platform',
        });

        const client = await auth.getClient();
        const projectId = await auth.getProjectId();

        const response = await fetch(
            `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${await client.getAccessToken()}`,
                },
                body: JSON.stringify({
                    event: {
                        token: token,
                        siteKey: '6LdjDY4qAAAAAPyTSMSMQsQ5R_Q0S0iTy1RDIQEz',
                        expectedAction: action,
                    },
                }),
            }
        );

        const result = await response.json();
        if (!result.tokenProperties || !result.tokenProperties.valid) {
            throw new Error('El token de reCAPTCHA no es válido.');
        }

        return result;
    } catch (error) {
        console.error('Error al validar reCAPTCHA:', error.message);
        throw new Error('Error al procesar la validación de reCAPTCHA.');
    }
}

// Endpoint para validar reCAPTCHA
app.post('/verify-recaptcha', async (req, res) => {
    const { token, action } = req.body;

    if (!token || !action) {
        return res.status(400).json({
            success: false,
            message: 'Token de reCAPTCHA o acción no proporcionados.',
        });
    }

    try {
        const result = await validateRecaptcha(token, action);

        if (result.riskAnalysis.score < 0.5) {
            return res.status(400).json({
                success: false,
                message: 'Actividad sospechosa detectada.',
                score: result.riskAnalysis.score,
            });
        }

        res.json({
            success: true,
            message: 'Validación exitosa.',
            score: result.riskAnalysis.score,
        });
    } catch (error) {
        console.error('Error al validar reCAPTCHA:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Endpoint para crear un documento en Firestore
app.post('/add-user', async (req, res) => {
    const { email, name } = req.body;

    if (!email || !name) {
        return res.status(400).json({
            success: false,
            message: 'Faltan campos requeridos (email, name).',
        });
    }

    try {
        const newUser = {
            email: email,
            name: name,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        const docRef = await db.collection('users').add(newUser);
        res.json({
            success: true,
            message: 'Usuario agregado exitosamente.',
            userId: docRef.id,
        });
    } catch (error) {
        console.error('Error al agregar usuario:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Endpoint para obtener usuarios de Firestore
app.get('/get-users', async (req, res) => {
    try {
        const snapshot = await db.collection('users').get();
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.json({
            success: true,
            users: users,
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Endpoint para validar Firebase ID Token y reCAPTCHA
app.post('/secure-endpoint', async (req, res) => {
    const { idToken, recaptchaToken, action } = req.body;

    if (!idToken || !recaptchaToken || !action) {
        return res.status(400).json({ success: false, message: 'Datos faltantes' });
    }

    try {
        // Verificar el token de Firebase Authentication
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        console.log('Usuario autenticado:', decodedToken);

        // Validar reCAPTCHA
        const recaptchaResult = await validateRecaptcha(recaptchaToken, action);
        if (!recaptchaResult || recaptchaResult.riskAnalysis.score < 0.5) {
            return res.status(400).json({ success: false, message: 'reCAPTCHA no válido o sospechoso' });
        }

        res.json({ success: true, message: 'Validación exitosa' });
    } catch (error) {
        console.error('Error en la validación:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
