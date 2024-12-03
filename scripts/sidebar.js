document.addEventListener("DOMContentLoaded", function () {
    fetch('../html/sidebar.html')
        .then(response => response.text())
        .then(data => {
            const sidebarContainer = document.getElementById('sidebar-container');
            if (sidebarContainer) {
                sidebarContainer.innerHTML = data;

                 // Actualizar encabezado de la barra lateral con el rol del usuario
                 updateSidebarRole();

                // Ajustar la visibilidad de los módulos de la barra lateral según el rol del usuario
                manageSidebarVisibility();

                // Lógica para el botón "Salir"
                const logoutButton = document.getElementById('logout');
                if (logoutButton) {
                    logoutButton.addEventListener('click', function () {
                        if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
                            // Limpiar localStorage o sessionStorage
                            localStorage.removeItem('userRole'); // Elimina el rol del usuario
                            localStorage.removeItem('authToken'); // Elimina el token de autenticación si se usa
                            sessionStorage.clear(); // Limpia cualquier dato en sessionStorage

                            // Redirigir al inicio de sesión
                            window.location.href = "../index.html";
                        }
                    });
                    console.log("Botón 'Salir' configurado correctamente.");
                } else {
                    console.error("No se encontró el botón 'Salir'.");
                }

                // Seleccionar elementos requeridos
                const menuToggle = document.querySelector('.menu-toggle');
                const sidebar = document.querySelector('.sidebar');
                const content = document.querySelector('.container-fluid');

                if (menuToggle && sidebar) {
                    // Asignar evento de clic al botón de menú
                    menuToggle.addEventListener('click', function () {
                        sidebar.classList.toggle('collapsed');
                        if (content) {
                            content.classList.toggle('collapsed');
                        }
                    });

                    // Asignar evento de clic a los enlaces de la barra lateral
                    const sidebarLinks = document.querySelectorAll('.sidebar ul li a');
                    sidebarLinks.forEach(link => {
                        link.addEventListener('click', function () {
                            if (window.innerWidth <= 768) {
                                sidebar.classList.add('collapsed');
                                if (content) {
                                    content.classList.add('collapsed');
                                }
                            }
                        });
                    });
                } else {
                    console.error("No se encontraron los elementos '.menu-toggle' o '.sidebar'.");
                }

                
                // Evento para el botón de ayuda (Formulario de contacto)
                const helpButton = document.getElementById('help-button');
                const chatbotModal = document.getElementById('chatbot-modal');
                const closeButton = document.querySelector('.close-button');
                const chatbotForm = document.getElementById('chatbot-form');  // El formulario para enviar consulta

                if (helpButton && chatbotModal && closeButton && chatbotForm) {
                    // Mostrar el modal del formulario
                    helpButton.addEventListener('click', function () {
                        chatbotModal.style.display = "block";
                    });

                    // Cerrar el modal del formulario
                    closeButton.addEventListener('click', function () {
                        chatbotModal.style.display = "none";
                    });

                    // Cerrar el modal cuando el usuario haga clic fuera del contenido del modal
                    window.addEventListener('click', function (event) {
                        if (event.target === chatbotModal) {
                            chatbotModal.style.display = "none";
                        }
                    });

                    // Manejar el envío del formulario
                    chatbotForm.addEventListener('submit', function (event) {
                        event.preventDefault();  // Evitar el envío tradicional del formulario

                        // Enviar los datos con EmailJS
                        emailjs.sendForm('service_k9kohru', 'template_votdwtd', chatbotForm)
                            .then(function (response) {
                                alert('Tu consulta ha sido enviada. ¡Gracias por contactar!');
                                chatbotModal.style.display = "none";  // Cerrar el modal
                            }, function (error) {
                                alert('Hubo un error al enviar tu consulta. Intenta nuevamente más tarde.');
                                console.error('Error al enviar el correo:', error);
                            });
                    });
                } else {
                    console.error("No se encontraron todos los elementos requeridos para el chatbot.");
                }
            } else {
                console.error("No se encontró el contenedor con ID 'sidebar-container'.");
            }
        })
        .catch(error => console.error('Error al cargar la barra lateral:', error));

    // Ajustar la vista de la barra lateral según el tamaño de la ventana
    window.addEventListener('resize', function () {
        const sidebar = document.querySelector('.sidebar');
        const content = document.querySelector('.content');
        if (sidebar) {
            if (window.innerWidth <= 768) {
                sidebar.classList.add('collapsed');
                if (content) {
                    content.classList.add('collapsed');
                }
            } else {
                sidebar.classList.remove('collapsed');
                if (content) {
                    content.classList.remove('collapsed');
                }
            }
        }
    });
});

// Nueva función para actualizar el encabezado de la barra lateral con el rol del usuario
function updateSidebarRole() {
    const userRole = localStorage.getItem('userRole');
    const sidebarRoleElement = document.getElementById('sidebar-role');

    if (sidebarRoleElement && userRole) {
        sidebarRoleElement.textContent = userRole; // Mostrar el rol del usuario
    } else {
        console.error("No se encontró el elemento 'sidebar-role' o el rol del usuario.");
    }
}

// Nueva función para manejar la visibilidad de la barra lateral según el rol
function manageSidebarVisibility() {
    const userRole = localStorage.getItem('userRole');

    if (!userRole) {
        alert("No se encontró el rol del usuario. Redirigiendo...");
        window.location.href = "../index.html";
        return;
    }

    // Definir los enlaces visibles para cada rol
    const roleLinks = {
        "Administrador": [
            "link-gestion-causas",
            "link-honorarios",
            "link-eventos",
            "link-reportes",
            "link-mantenedores"
        ],
        "Asistente Administrativo": [
            "link-gestion-causas",
            "link-honorarios",
            "link-eventos",
            "link-reportes"
        ],
        "Abogado": [
            "link-gestion-causas",
            "link-honorarios",
            "link-eventos"
        ]
    };

    // Ocultar todos los enlaces inicialmente
    const allLinks = document.querySelectorAll('.sidebar ul li');
    allLinks.forEach(link => {
        link.style.display = "none";
    });

    // Mostrar solo los enlaces permitidos para el rol
    if (roleLinks[userRole]) {
        roleLinks[userRole].forEach(linkId => {
            const link = document.getElementById(linkId);
            if (link) {
                link.style.display = "block";
            }
        });
    } else {
        alert("Acceso no autorizado.");
        window.location.href = "../index.html";
    }
}
