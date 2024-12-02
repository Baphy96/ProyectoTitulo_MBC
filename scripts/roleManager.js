export function checkUserRole() {
    // Verificar el rol del usuario desde localStorage
    const userRole = localStorage.getItem('userRole');
    console.log("Rol encontrado en localStorage:", userRole);

    if (!userRole) {
        alert("No se encontró el rol del usuario. Redirigiendo...");
        window.location.href = "../index.html"; // Redirigir si no hay rol
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
            "main-gestion-causas-visualizar",
            "main-honorarios-visualizar",
            "main-eventos"
        ]
    };

    // Ocultar todos los módulos inicialmente
    const allModules = document.querySelectorAll("[id^='main-']");
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
        window.location.href = "../index.html"; // Redirigir si el rol no es válido
    }

    // Aplicar permisos adicionales para los roles específicos
    applyPermissions(userRole);
}

function applyPermissions(role) {
    if (role === "Abogado") {
        // En los módulos de gestión de causas y honorarios solo permitir visualizar
        const restrictedModules = ["main-gestion-causas", "main-honorarios"];
        restrictedModules.forEach(moduleId => {
            const module = document.getElementById(moduleId);
            if (module) {
                // Desactivar botones de agregar, editar, eliminar
                const buttons = module.querySelectorAll(".btn-agregar, .btn-editar, .btn-eliminar");
                buttons.forEach(button => {
                    button.disabled = true;
                    button.style.pointerEvents = "none";  // Evitar interacción
                    button.classList.add("disabled");
                });
            }
        });
    }
}
