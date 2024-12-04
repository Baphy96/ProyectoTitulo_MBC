document.addEventListener("DOMContentLoaded", function () {
    // Inicializar EmailJS
    loadEmailJs();

    function loadEmailJs() {
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js";
        script.onload = function () {
            if (typeof emailjs !== 'undefined') {
                emailjs.init("_7XYnbFeyGNpNAjG6"); // Reemplaza con tu clave pública
                console.log("EmailJS se ha inicializado correctamente.");
            } else {
                console.error("No se pudo inicializar EmailJS. Asegúrate de que el script se haya cargado correctamente.");
            }
        };
        script.onerror = function () {
            console.error("Error al cargar el script de EmailJS.");
        };
        document.head.appendChild(script);
    }

    // Cargar el contenido de la barra lateral
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
                            localStorage.removeItem('userRole');
                            localStorage.removeItem('authToken');
                            sessionStorage.clear();
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
                    menuToggle.addEventListener('click', function () {
                        sidebar.classList.toggle('collapsed');
                        if (content) {
                            content.classList.toggle('collapsed');
                        }
                    });

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
                const chatbotForm = document.getElementById('chatbot-form');

                if (helpButton && chatbotModal && closeButton && chatbotForm) {
                    helpButton.addEventListener('click', function () {
                        chatbotModal.style.display = "block";
                    });

                    closeButton.addEventListener('click', function () {
                        chatbotModal.style.display = "none";
                    });

                    window.addEventListener('click', function (event) {
                        if (event.target === chatbotModal) {
                            chatbotModal.style.display = "none";
                        }
                    });

                    chatbotForm.addEventListener('submit', function (event) {
                        event.preventDefault();
                        if (typeof emailjs !== 'undefined') {
                            emailjs.sendForm('service_k9kohru', 'template_votdwtd', chatbotForm)
                                .then(function (response) {
                                    alert('Tu consulta ha sido enviada. ¡Gracias por contactar!');
                                    chatbotModal.style.display = "none";
                                }, function (error) {
                                    alert('Hubo un error al enviar tu consulta. Intenta nuevamente más tarde.');
                                    console.error('Error al enviar el correo:', error);
                                });
                        } else {
                            console.error("EmailJS no está definido. Asegúrate de que el script se haya cargado correctamente.");
                        }
                    });
                } else {
                    console.error("No se encontraron todos los elementos requeridos para el chatbot.");
                }

            } else {
                console.error("No se encontró el contenedor con ID 'sidebar-container'.");
            }
        })
        .catch(error => console.error('Error al cargar la barra lateral:', error));

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
