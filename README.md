**SISTEMA DE GESTIÓN JUDICIAL - README**

**Descripción General**

El sistema de Gestión Judicial es una herramienta web para la gestión de casos judiciales en pequeñas empresas jurídicas. Ofrece funcionalidades clave como la gestión de causas, honorarios, eventos y la generación de reportes. Además, el sistema está diseñado con un enfoque en roles y permisos, proporcionando a cada tipo de usuario (abogados, asistentes administrativos y administradores) acceso personalizado a las herramientas y funcionalidades según sus responsabilidades.

**Propósito**

El Sistema tiene como propósito principal mejorar la gestión de procesos legales en pequeñas empresas jurídicas mediante una solución tecnológica diseñada para optimizar la eficiencia y productividad del personal jurídico. Diseñado para abordar los desafíos comunes en la gestión judicial, este sistema automatiza tareas esenciales como la gestión de casos judiciales, el seguimiento de honorarios, generación de reportes y la comunicación entre los miembros del equipo legal.

Al centralizar y optimizar estos procesos, el sistema permite a las empresas concentrarse en sus responsabilidades legales, disminuyendo la carga operativa y promoviendo la colaboración mediante una interfaz intuitiva, accesible y adaptada a las necesidades específicas del sector jurídico.


**Características**
- Gestíon de causas judiciales.
- Control de honorarios y pagos.
- Planificación y gestión de eventos.
- Generación de reportes.
- Roles de usuarios con permisos personalizados.

**Estado del Proyecto**

Actualmente, el sistema se encuentra en la versión 1.0.0 y se está probando en entornos locales. Se están incorporando mejoras continuas, como la optimización de las interfaces y la seguridad de los datos.

**Requisitos del Entorno de Desarrollo**
- Node.js: Versión 14 o superior.
- Firebase CLI: Para la autenticación y Firestore.
- Navegador Web: Chrome, Firefox, u otro navegador moderno.
- Servidor Local: Puede utilizarse cualquier servidor HTTP local, como Apache, Nginx, o herramientas como Live Server para Visual Studio Code.

**Guía para la Instalación y Funcionamiento**

1.- Clonar el Repositorio
Clona el repositorio del proyecto en tu servidor local utilizando Git:
  
    $ git clone https://github.com/tu-usuario/gestion-judicial.git

2.- Instalar Dependencias: 
Instala las dependencias necesarias en el proyecto. En el directorio raíz del proyecto, ejecuta:
    
    $ npm install

3.- Configurar Firebase

- Crea un proyecto en Firebase Console y habilita Authentication y Firestore.

- Actualiza el archivo firebaseConfig en inicioSesion.js con las credenciales de tu proyecto de Firebase.

4.- Configurar el Servidor Local: 
Puedes usar cualquier servidor HTTP. Por ejemplo, si tienes Live Server instalado en Visual Studio Code, puedes iniciar el servidor desde el ícono correspondiente o ejecutar:
    
    $ live-server

5.- Iniciar Sesión

- Dirígete a la URL del servidor local (por defecto http://127.0.0.1:5500).
- Utiliza las siguientes credenciales para el primer inicio de sesión:

     - Administrador:

        Correo: sistemawebdegestiondecasosjudi@gmail.com

        Contraseña: Admin123*

    - Asistente Administrativo:
    
        Correo: mbarrios.caro@gmail.com

        Contraseña: Asistente123*

    - Abogado:

        Correo: mbc.abogados.sa@gmail.com

        Contraseña: Abogado123*

6.- Restablecer Contraseña:
Para restablecer la contraseña, haz clic en el enlace ¿Olvidaste tu contraseña? y sigue las instrucciones proporcionadas. La contraseña debe cumplir con los siguientes criterios:

- Longitud mínima de 8 caracteres.

- Al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.

7.- Actualizar Contraseña:
Tras recibir el correo de restablecimiento, la nueva contraseña debe cumplir con los mismos criterios de seguridad para garantizar la robustez.

**Códigos de Programación Utilizados**

Los principales lenguajes y librerías utilizadas son:

- JavaScript: Lógica de autenticación, validación y funcionalidad del sistema.
- HTML/CSS: Para la estructura de las vistas y diseño de los elementos visuales del sistema.
- Firebase (Firestore, Authentication): Para la gestión de usuarios y almacenamiento de datos.
- Bootstrap: Estilos y componentes para la interfaz de usuario.
- EmailJS: Para la integración del servicio de correos electrónicos.

**Dónde Obtener Ayuda**

Si tienes alguna pregunta o necesitas ayuda, revisa la documentación oficial de Firebase o EmailJS. También puedes abrir un issue en el repositorio de GitHub para discutir problemas específicos.

 - Firebase: Firebase Documentation
- EmailJS: EmailJS Documentation

**Mantenimiento y Contribuciones**

El proyecto es mantenido por el desarrollador Magaly Barrios. Se aceptan contribuciones y sugerencias para mejorar el sistema. Puedes contribuir mediante pull requests en el repositorio oficial.

Contacto para contribuciones: sistemawebdegestiondecasosjudi@gmail.com

**Conclusión**

Este sistema de gestión judicial proporciona una solución integral para el manejo y organización de casos judiciales. Con la integración de Firebase para la autenticación y la robustez de las contraseñas, asegura un acceso seguro y controlado a los recursos del sistema.
