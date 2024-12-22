// Función para validar el acceso basado en roles
export function validateAccess(requiredRoles = []) {
    const userRole = localStorage.getItem('userRole');
    console.log("Rol del usuario:", userRole);

    // Si no hay rol, redirigir
    if (!userRole) {
        alert("No se encontró el rol del usuario. Redirigiendo...");
        window.location.href = "../index.html";
        return false;
    }

    // Si el rol no está permitido, redirigir
    if (!requiredRoles.includes(userRole)) {
        alert("No tienes permiso para acceder a esta página.");
        window.location.href = "../index.html";
        return false;
    }

    console.log("Acceso permitido para el rol:", userRole);
    return true; // El rol es válido
}

// Función para mostrar módulos según el rol del usuario
export function checkUserRole() {
    const userRole = localStorage.getItem('userRole');

    // Si no hay rol, redirigir
    if (!userRole) {
        alert("No se encontró el rol del usuario. Redirigiendo...");
        window.location.href = "../index.html";
        return;
    }

    console.log("Rol del usuario:", userRole);

    // Definir módulos visibles por rol
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
    if (role === "Administrador") {
        // Habilitar todos los botones de agregar, editar, eliminar
        const allModules = document.querySelectorAll("[id^='main-']");
        allModules.forEach(module => {
            const buttons = module.querySelectorAll(".btn-agregar, .btn-editar, .btn-eliminar");
            buttons.forEach(button => {
                button.disabled = false;
                button.style.pointerEvents = "auto";
                button.classList.remove("disabled");
            });
        });
    } else if (role === "Asistente Administrativo") {
        // Habilitar botones de agregar, editar, eliminar en módulos específicos
        const allowedModules = ["main-gestion-causas", "main-honorarios", "main-eventos", "main-reportes"];
        allowedModules.forEach(moduleId => {
            const module = document.getElementById(moduleId);
            if (module) {
                const buttons = module.querySelectorAll(".btn-agregar, .btn-editar, .btn-eliminar");
                buttons.forEach(button => {
                    button.disabled = false;
                    button.style.pointerEvents = "auto";
                    button.classList.remove("disabled");
                });
            }
        });

        // Deshabilitar otros módulos
        const allModules = document.querySelectorAll("[id^='main-']");
        allModules.forEach(module => {
            if (!allowedModules.includes(module.id)) {
                const buttons = module.querySelectorAll(".btn-agregar, .btn-editar, .btn-eliminar");
                buttons.forEach(button => {
                    button.disabled = true;
                    button.style.pointerEvents = "none";
                    button.classList.add("disabled");
                });
            }
        });
    } else if (role === "Abogado") {
        // Restricciones específicas en el módulo de honorarios
        const honorariosModule = document.getElementById("main-honorarios");
        if (honorariosModule) {
            // Deshabilitar el botón "Pagar" dentro del modal de pagos
            const payButton = document.querySelector("#paymentModal button[type='submit']");
            if (payButton) {
                payButton.disabled = true;
                payButton.style.pointerEvents = "none";
                payButton.classList.add("disabled");
            }

            // Deshabilitar el botón "Guardar Cambios" en el modal de edición de pagos
            const editButton = document.querySelector("#editPaymentModal #saveEditedPayments");
            if (editButton) {
                editButton.disabled = true;
                editButton.style.pointerEvents = "none";
                editButton.classList.add("disabled");
            }

            console.log("Botones de Pagar y Editar deshabilitados para el rol 'Abogado'.");
        }

        // En los módulos de gestión de causas solo permitir visualizar
        const restrictedModules = ["main-gestion-causas"];
        restrictedModules.forEach(moduleId => {
            const module = document.getElementById(moduleId);
            if (module) {
                const buttons = module.querySelectorAll(".btn-agregar, .btn-editar, .btn-eliminar");
                buttons.forEach(button => {
                    button.disabled = true;
                    button.style.pointerEvents = "none"; // Evitar interacción
                    button.classList.add("disabled");
                });
            }
        });

        // Permitir todas las acciones en el módulo de eventos
        const eventsModule = document.getElementById("main-eventos");
        if (eventsModule) {
            const buttons = eventsModule.querySelectorAll(".btn-agregar, .btn-editar, .btn-eliminar");
            buttons.forEach(button => {
                button.disabled = false;
                button.style.pointerEvents = "auto";
                button.classList.remove("disabled");
            });
        }
    }
}



