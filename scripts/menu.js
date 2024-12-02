import { checkUserRole } from './roleManager.js';

document.addEventListener('DOMContentLoaded', function () {
    // Verificar el rol del usuario y manejar los módulos visibles
    checkUserRole();

    // Mostrar/ocultar el menú desplegable
    const dropdownToggle = document.getElementById('dropdown-toggle');
    const dropdownMenu = document.getElementById('dropdown-menu');

    if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener('click', function () {
            dropdownMenu.classList.toggle('show');
        });

        // Cerrar el menú si se hace clic fuera de él
        window.addEventListener('click', function (event) {
            if (!event.target.matches('#dropdown-toggle') && !event.target.closest('.user-info')) {
                dropdownMenu.classList.remove('show');
            }
        });
    }

    // Redirección para los botones de "Salir" y "Cerrar sesión"
    const logoutButton = document.getElementById('logout');
    const logoutSession = document.getElementById('logout-session');

    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            // Eliminar el rol del localStorage para cerrar sesión
            localStorage.removeItem('userRole');
            window.location.href = "../index.html"; // Redirigir al inicio de sesión
        });
    }

    if (logoutSession) {
        logoutSession.addEventListener('click', function () {
            // Eliminar el rol del localStorage para cerrar sesión
            localStorage.removeItem('userRole');
            window.location.href = "../index.html"; // Redirigir al inicio de sesión
        });
    }

    // Ocultar o mostrar los módulos del menú según el rol del usuario
    manageMenuVisibility();
});

function manageMenuVisibility() {
    const userRole = localStorage.getItem('userRole');

    if (!userRole) {
        alert("No se encontró el rol del usuario. Redirigiendo...");
        window.location.href = "../index.html";
        return;
    }

    // Definir módulos visibles para cada rol
    const roleModules = {
        "Administrador": [
            "main-gestion-causas",
            "main-honorarios",
            "main-eventos",
            "main-reportes",
            "main-mantendores"
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

    // Mostrar solo los módulos permitidos para el rol
    if (roleModules[userRole]) {
        roleModules[userRole].forEach(moduleId => {
            const module = document.getElementById(moduleId);
            if (module) {
                module.style.display = "block";
            }
        });
    } else {
        alert("Acceso no autorizado.");
        window.location.href = "../index.html";
    }
}
