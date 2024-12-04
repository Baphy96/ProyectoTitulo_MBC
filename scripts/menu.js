import { checkUserRole } from './roleManager.js';

document.addEventListener('DOMContentLoaded', function () {
    // Verificar el rol del usuario y manejar los módulos visibles
    checkUserRole();
    manageMenuVisibility(); // Mostrar módulos según el rol   
    setupLogoutButtons(); // Configurar botones de cierre de sesión
});

// Función para manejar la visibilidad de los módulos según el rol del usuario
function manageMenuVisibility() {
    const userRole = localStorage.getItem('userRole');

    if (!userRole) {
        console.error("No se encontró el rol del usuario. Redirigiendo...");
        window.location.href = "../index.html";
        return;
    }

    console.log("Rol del usuario detectado:", userRole);

    // Definir módulos visibles para cada rol
    const roleModules = {
        "Administrador": [
            "main-gestion-causas",
            "main-honorarios",
            "main-eventos",
            "main-reportes"
        ],
        "Asistente Administrativo": [
            "main-gestion-causas",
            "main-honorarios",
            "main-eventos",
            "main-reportes"
        ],
        "Abogado": [
            "main-gestion-causas",
            "main-honorarios",
            "main-eventos"
        ]
    };

    // Ocultar todos los módulos inicialmente
    const allModules = document.querySelectorAll(".card");
    allModules.forEach(module => {
        module.style.display = "none";
    });

    // Mostrar solo los módulos permitidos para el rol actual
    if (roleModules[userRole]) {
        roleModules[userRole].forEach(moduleId => {
            const module = document.getElementById(moduleId);
            if (module) {
                module.style.display = "block";
            } else {
                console.warn(`No se encontró el módulo con ID: ${moduleId}`);
            }
        });
    } else {
        console.error("Acceso no autorizado para el rol:", userRole);
        window.location.href = "../index.html";
    }
}


// Configuración de los botones de cerrar sesión
function setupLogoutButtons() {
    const logoutButton = document.getElementById('logout');
    const logoutSession = document.getElementById('logout-session');

    const handleLogout = () => {
        localStorage.removeItem('userRole'); // Eliminar el rol almacenado
        window.location.href = "../index.html"; // Redirigir al inicio de sesión
    };

    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    if (logoutSession) {
        logoutSession.addEventListener('click', handleLogout);
    }
}
