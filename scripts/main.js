
// Obtener referencias a las pestañas y los formularios
const registerTab = document.getElementById('register-tab');
const loginTab = document.getElementById('login-tab');
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');

// Evento de clic para mostrar el formulario de registro y ocultar el de inicio de sesión
registerTab.addEventListener('click', function () {
    registerForm.classList.add('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    loginForm.classList.remove('active');
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
});

// Evento de clic para mostrar el formulario de inicio de sesión y ocultar el de registro
loginTab.addEventListener('click', function () {
    loginForm.classList.add('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    registerForm.classList.remove('active');
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
});

