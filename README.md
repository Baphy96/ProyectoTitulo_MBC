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
- Navegador Web: Chrome, Firefox, u otro navegador moderno.
- XAMPP: Para ejecutar un servidor local con Apache y MySQL.
- Visual Studio Code (VS Code): Para editar y gestionar el código
- Firebase CLI: Para la configuración y administración de Firestore y Authentication.
- Conexión a Internet: Requerida para la integración con Firebase y para descargar las librerías y dependencias necesarias.

**Guía para la Instalación y Funcionamiento**

Con los siguientes pasos, se podrá configurar y ejecutar el sistema web en un servidor local.

1.- Verifica los requisitos del sistema

Antes de proceder, asegúrate de que tienes lo siguiente instalado:

 - XAMPP: Para ejecutar un servidor local con Apache y MySQL.
 - Visual Studio Code (VS Code): Para editar y gestionar el código.

2.- Configura XAMPP

- Inicia XAMPP:
    - Abre XAMPP y enciende los módulos Apache y MySQL.
    - Verifica que el servidor web esté activo accediendo a http://localhost en tu navegador. Deberías ver la página de inicio de XAMPP.
- Crea una carpeta para tu proyecto:
    - Ve a la carpeta de instalación de XAMPP (generalmente C:\xampp\htdocs en Windows).
    - Crea una subcarpeta con el nombre de tu proyecto, por ejemplo, gestion-judicial.
- Copia los archivos del proyecto:
    - Descarga y descomprime el proyecto desde GitHub (si no lo has hecho ya).
    - Copia los archivos del sistema web y pégalos en la carpeta que creaste en htdocs.

3.- Ejecuta el sistema web

- Inicia el servidor local:
    - Abre tu navegador y ve a http://localhost/gestion-judicial (o el nombre de la carpeta que usaste en htdocs).
- Prueba la aplicación
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
    - Navega por la aplicación para asegurarte de que las funcionalidades estén operativas.
    - Si encuentras problemas, revisa la consola de XAMPP (Apache y MySQL) y verifica los logs para depurar errores.

4.- Restablecer Contraseña

Para restablecer la contraseña, haz clic en el enlace ¿Olvidaste tu contraseña? y sigue las instrucciones proporcionadas. La contraseña debe cumplir con los siguientes criterios:

- Longitud mínima de 8 caracteres.

- Al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.

5.- Actualizar Contraseña

Tras recibir el correo de restablecimiento, la nueva contraseña debe cumplir con los mismos criterios de seguridad para garantizar la robustez.

6.- (Opcional) Configuración en VS Code

- Abre el proyecto en Visual Studio Code:
    - Haz clic en File > Open Folder y selecciona la carpeta de tu proyecto en htdocs.
- Instala extensiones útiles:
    - HTML CSS Support: Para trabajar con HTML y CSS.
    - Prettier: Para formatear el código automáticamente.
- Configura un Live Preview
    - Instala la extensión Live Preview desde el VS Code.
    - Haz clic derecho en el archivo HTML principal (por ejemplo, index.html) y selecciona Open with Live Preview para probar la interfaz en tu navegador.


**Tecnologías Utilizadas**

Los principales lenguajes y librerías utilizadas son:

- JavaScript: Utilizado para la lógica de autenticación, validación, funcionalidades dinámicas y comunicación con Firebase.
- HTML/CSS: Para la estructura de las vistas y diseño de los elementos visuales del sistema.
- Firebase (Firestore, Authentication): Usado para la gestión de usuarios, autenticación y almacenamiento de datos en tiempo real.
- Bootstrap: Framework de CSS y JS utilizado para proporcionar estilos y componentes interactivos en la interfaz de usuario.
- EmailJS: Integrado para el envío de correos electrónicos sin necesidad de un servidor backend.
- Font Awesome: Biblioteca de iconos para mejorar la estética y accesibilidad de la interfaz.
- Bootstrap Multiselect: Extensión de Bootstrap para implementar selección múltiple en formularios.
- DataTables: Usado para crear tablas interactivas con características como búsqueda, ordenación y paginación.
- FullCalendar: Utilizado para mostrar calendarios interactivos con eventos personalizados.
- jQuery: Biblioteca JavaScript para manipulación del DOM, eventos y peticiones AJAX.
- Popper.js: Maneja elementos emergentes como tooltips y dropdowns en la interfaz.
- jsPDF: Permite generar documentos PDF directamente en el navegador.
- html2canvas: Biblioteca utilizada para capturar capturas de pantalla de elementos HTML.
- xlsx: Proporciona la funcionalidad de exportar y procesar datos en formato Excel.
- Chart.js y Chart.js Plugin Datalabels: Implementados para la creación de gráficos interactivos y personalizables, además de mostrar etiquetas en los datos.

**Dónde Obtener Ayuda**

Si tienes alguna pregunta o necesitas ayuda, revisa la documentación oficial de Firebase o EmailJS. También puedes abrir un issue en el repositorio de GitHub para discutir problemas específicos.

 - Firebase: Firebase Documentation
 - EmailJS: EmailJS Documentation

**Mantenimiento y Contribuciones**

El proyecto es mantenido por el desarrollador Magaly Barrios. Se aceptan contribuciones y sugerencias para mejorar el sistema. Puedes contribuir mediante pull requests en el repositorio oficial.

Contacto para contribuciones: sistemawebdegestiondecasosjudi@gmail.com

**Conclusión**

Este sistema de gestión judicial proporciona una solución integral que centraliza y optimiza procesos clave como la administración de causas, honorarios, eventos y reportes. Diseñado con tecnologías modernas y roles personalizados, garantiza seguridad, eficiencia y colaboración entre equipos legales. Este sistema reduce la carga administrativa, permitiendo a las empresas jurídicas enfocarse en sus funciones esenciales mientras ofrece una interfaz intuitiva y funcional en constante mejora.
