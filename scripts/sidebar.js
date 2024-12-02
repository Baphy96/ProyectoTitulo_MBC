document.addEventListener("DOMContentLoaded", function () {
    fetch('../html/sidebar.html')
        .then(response => response.text())
        .then(data => {
            const sidebarContainer = document.getElementById('sidebar-container');
            if (sidebarContainer) {
                sidebarContainer.innerHTML = data;

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

               // Cargar EmailJS si no está cargado
               if (typeof emailjs === 'undefined') {
                   const script = document.createElement('script');
                   script.src = "https://cdn.emailjs.com/dist/email.min.js";
                   script.onload = function() {
                       emailjs.init('_7XYnbFeyGNpNAjG6');  // Reemplaza con tu ID de usuario real de EmailJS
                       initializeForm();
                   };
                   document.head.appendChild(script);
               } else {
                   emailjs.init('_7XYnbFeyGNpNAjG6');
                   initializeForm();
               }

               // Función para inicializar el formulario con los datos del usuario
               function initializeForm() {
                   // Llenar los campos del formulario con el nombre y correo del usuario
                   const userName = "Nombre del Usuario";  // Aquí puedes obtener el nombre del usuario dinámicamente
                   const userEmail = "usuario@correo.com";  // Aquí puedes obtener el correo del usuario dinámicamente

                   document.getElementById('user-name').value = userName;
                   document.getElementById('user-email').value = userEmail;

                   // Manejar el envío del formulario
                   chatbotForm.addEventListener('submit', function (event) {
                       event.preventDefault();  // Evitar el envío tradicional del formulario

                       // Obtener los valores del formulario
                       const userName = document.getElementById('user-name').value.trim();
                       const userEmail = document.getElementById('user-email').value.trim();
                       const userQuery = document.getElementById('user-query').value.trim();
                       const userDetails = document.getElementById('user-details').value.trim();

                       // Validar los campos
                       if (userName && userEmail && userQuery) {
                           // Enviar los datos con EmailJS
                           emailjs.send('service_k9kohru', 'template_votdwtd', {
                               user_name: userName,
                               user_email: userEmail,
                               user_query: userQuery,
                               user_details: userDetails
                           }).then(function(response) {
                               alert('Tu consulta ha sido enviada. ¡Gracias por contactar!');
                               chatbotModal.style.display = "none";  // Cerrar el modal
                           }, function(error) {
                               alert('Hubo un error al enviar tu consulta. Intenta nuevamente más tarde.');
                               console.error('Error al enviar el correo:', error);
                           });
                       } else {
                           alert("Por favor, completa todos los campos obligatorios.");
                       }
                   });
               }
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
