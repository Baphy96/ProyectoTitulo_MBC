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
                const content = document.querySelector('.content');

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
