document.addEventListener('DOMContentLoaded', function() {
    // Mostrar/ocultar el menú desplegable
    const dropdownToggle = document.getElementById('dropdown-toggle');
    const dropdownMenu = document.getElementById('dropdown-menu');

    if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener('click', function() {
            dropdownMenu.classList.toggle('show');
        });

        // Cerrar el menú si se hace clic fuera de él
        window.addEventListener('click', function(event) {
            if (!event.target.matches('#dropdown-toggle') && !event.target.closest('.user-info')) {
                dropdownMenu.classList.remove('show');
            }
        });
    }

    // Redirección para los botones de "Salir" y "Cerrar sesión"
    const logoutButton = document.getElementById('logout');
    const logoutSession = document.getElementById('logout-session');

    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            window.location.href = "../index.html";
        });
    }

    if (logoutSession) {
        logoutSession.addEventListener('click', function() {
            window.location.href = "../index.html";
        });
    }
});

