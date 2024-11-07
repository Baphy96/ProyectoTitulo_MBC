import { collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { db } from "../firebaseConfig.js"; // Importar la instancia inicializada de Firestore desde firebaseConfig.js

document.addEventListener('DOMContentLoaded', function () { 
    const addCauseButton = document.getElementById('addCause');
    const addCauseModal = document.getElementById('addCauseModal');
    const closeModalButtons = document.querySelectorAll('.close');
    const newCauseForm = document.getElementById('newCauseForm');
    const honorariosButton = document.getElementById('honorariosButton');
    const honorariosModal = document.getElementById('honorariosModal');
    const honorariosForm = document.getElementById('honorariosForm');
    const searchForm = document.getElementById('searchForm');
    const resultsTableBody = document.getElementById('resultsTableBody');
    const maintainerModal = document.getElementById('maintainerModal');
    const maintainerForm = document.getElementById('maintainerForm');

    // Abrir el modal al hacer clic en "Agregar Nueva Causa"
    addCauseButton.addEventListener('click', function () {

        addCauseModal.style.display = 'block';
        loadDropdownOptions(); // Cargar opciones al abrir el modal
    });
    
    // Cerrar los modales al hacer clic en la "X"
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function () {
            addCauseModal.style.display = 'none';
            honorariosModal.style.display = 'none';
            maintainerModal.style.display = 'none';
        });
    });

    // Cerrar el modal si el usuario hace clic fuera del contenido del modal
    window.addEventListener('click', function (event) {
        if (event.target === addCauseModal) {
            addCauseModal.style.display = 'none';
        }
        if (event.target === honorariosModal) {
            honorariosModal.style.display = 'none';
        }
    });

            /* ====================
       MODAL BOTON AGREGAR CLIENTE
       ==================== */

    /// Manejar clic en botones para agregar cliente desde "Agregar Nueva Causa"
    const formContent = `
        <div class="form-row">
            <label for="entityRut">RUT:</label>
            <input type="text" id="entityRut" name="entityRut" required>
        </div>
        <div class="form-row">
            <label for="entityName">Nombre:</label>
            <input type="text" id="entityName" name="entityName" required>
        </div>
        <div class="form-row">
            <label for="entityAddress">Dirección:</label>
            <input type="text" id="entityAddress" name="entityAddress" required>
        </div>
        <div class="form-row">
            <label for="entityPhone">Teléfono:</label>
            <input type="text" id="entityPhone" name="entityPhone" required>
        </div>
        <div class="form-row">
            <label for="entityEmail">Correo:</label>
            <input type="email" id="entityEmail" name="entityEmail" required>
        </div>
        <div class="form-actions">
            <button type="submit" class="save-button">Guardar</button>
        </div>
    `;

    // Manejar clic en botones para agregar Cliente desde "Agregar Nueva Causa"
    document.querySelectorAll('.add-button').forEach(button => {
        button.addEventListener('click', () => {
          //  console.log('Botón "Agregar Cliente" clicado'); // Debug: Verificar clic

            // Mostrar el modal utilizando la función `showModal`
            showModal("Agregar Nuevo Cliente", formContent, async function (event) {
                event.preventDefault();

                if (!validateForm()) {
                    return;
                }

                // Crear el objeto nuevo cliente
                const nuevaEntidad = {
                    Rut: document.getElementById('entityRut').value,
                    Nombre: document.getElementById('entityName').value,
                    Direccion: document.getElementById('entityAddress').value,
                    Telefono: document.getElementById('entityPhone').value,
                    Correo: document.getElementById('entityEmail').value,
                    TipoEntidad: "Cliente"  
                };

                try {
                    // Agregar la entidad al Firestore
                    await addDoc(collection(db, "Entidades"), nuevaEntidad);
                   // console.log("Entidad agregada con éxito.");

                    // Cerrar el modal y resetear el formulario
                    document.getElementById('maintainerModal').style.display = 'none';
                    document.getElementById('maintainerForm').reset();

                    // Añadir el nuevo cliente como primera opción en la lista desplegable de clientes en "Agregar Nueva Causa"
                    const clienteSelect = document.getElementById('cliente');
                    if (clienteSelect) {
                        const option = document.createElement('option');
                        option.value = nuevaEntidad.Rut;
                        option.text = nuevaEntidad.Nombre;

                        // Insertar la nueva opción como la primera en la lista
                        clienteSelect.insertBefore(option, clienteSelect.firstChild);

                        // Establecer la nueva opción como seleccionada
                        clienteSelect.selectedIndex = 0;

                       // console.log('Cliente agregado a la lista desplegable y seleccionado como la primera opción.');
                    }
                    // Volver a mostrar el modal de "Agregar Nueva Causa"
                    document.getElementById('addCauseModal').style.display = 'block';
                } catch (e) {
                    console.error("Error al agregar el cliente: ", e);
                }
            });
        });
    });

    // Manejar clic en el botón de cierre ("X") del modal "Agregar Nuevo Cliente"
    document.querySelectorAll('#maintainerModal.close').forEach(button => {
        button.addEventListener('click', () => {
            const maintainerModal = document.getElementById('maintainerModal');
            if (maintainerModal && maintainerModal.style.display === 'block') {
                maintainerModal.style.display = 'none';
               // console.log("Modal 'Agregar Nuevo Cliente' cerrado con 'X'.");

                // Mostrar nuevamente el modal "Agregar Nueva Causa"
                document.getElementById('addCauseModal').style.display = 'block';
            }
        });
    });


  // Función para validar el formulario
  function validateForm() {
    let isValid = true;
    const rut = document.getElementById('entityRut').value;
    if (!/^[0-9]{7,8}-[0-9kK]$/.test(rut) || !validateRut(rut)) {
        alert('RUT inválido. Por favor ingrese un RUT válido sin puntos pero con guion (ej: 12345678-9).');
        isValid = false;
    }

    const nombre = document.getElementById('entityName').value;
    if (nombre.trim().length < 3) {
        alert('El nombre es requerido y debe tener al menos 3 caracteres.');
        isValid = false;
    }

    const direccion = document.getElementById('entityAddress').value;
    if (direccion.trim().length < 5) {
        alert('La dirección es requerida y debe tener al menos 5 caracteres.');
        isValid = false;
    }

    const telefono = document.getElementById('entityPhone').value;
    if (!/^[0-9]{9}$/.test(telefono)) {
        alert('El teléfono debe tener 9 dígitos.');
        isValid = false;
    }

    const correo = document.getElementById('entityEmail').value;
    if (!/\S+@\S+\.\S+/.test(correo)) {
        alert('Correo inválido. Por favor ingrese un correo válido.');
        isValid = false;
    }

    return isValid;
 }

  // Función para validar el RUT con dígito verificador
 function validateRut(rut) {
    if (!/^[0-9]+-[0-9kK]$/.test(rut)) {
        return false;
    }
    const [num, dv] = rut.split('-');
    let suma = 0;
    let multiplicador = 2;
    for (let i = num.length - 1; i >= 0; i--) {
        suma += parseInt(num[i]) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    const dvEsperado = 11 - (suma % 11);
    const dvFinal = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
    return dvFinal.toLowerCase() === dv.toLowerCase();
 }


   // Cargar opciones de listas desplegables desde Firestore
async function loadDropdownOptions() {
    try {
        // Cargar Clientes, Abogados, Receptores Judiciales y Abogados Coordinadores desde Entidades
        const entidadesSnapshot = await getDocs(collection(db, "Entidades"));
        const clientes = [];
        const abogados = [];
        const receptores = [];
        const abogadosCoordinadores = [];

        entidadesSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.TipoEntidad === "Cliente") {
                clientes.push({ Rut: data.Rut, Nombre: data.Nombre });
            } else if (data.TipoEntidad === "Abogado") {
                abogados.push(data.Nombre);
            } else if (data.TipoEntidad === "Receptor Judicial") {
                receptores.push(data.Nombre);
            } else if (data.TipoEntidad === "Abogado Coordinador") {
                abogadosCoordinadores.push(data.Nombre);
            }
        });

        // Cargar Tribunales
        const tribunalesSnapshot = await getDocs(collection(db, "Tribunales"));
        const tribunales = tribunalesSnapshot.docs.map(doc => doc.data().Descripcion);

        // Cargar Tipos de Servicio
        const tiposServicioSnapshot = await getDocs(collection(db, "TipoServicio"));
        const tiposServicio = tiposServicioSnapshot.docs.map(doc => doc.data().Descripcion);

        // Cargar Estados
        const estadosSnapshot = await getDocs(collection(db, "EstadoJudicial"));
        const estados = estadosSnapshot.docs.map(doc => doc.data().Descripcion);

        document.getElementById('cliente').innerHTML = clientes.map(cliente =>
            `<option value="${cliente.Rut}">${cliente.Nombre}</option>`
        ).join('');
        

        // Llenar las demás listas desplegables
        document.getElementById('tribunal').innerHTML = tribunales.map(t => `<option value="${t}">${t}</option>`).join('');
        document.getElementById('abogadoResponsable').innerHTML = abogados.map(a => `<option value="${a}">${a}</option>`).join('');
        document.getElementById('abogadoCoordinador').innerHTML = abogadosCoordinadores.map(ac => `<option value="${ac}">${ac}</option>`).join('');
        document.getElementById('receptorJudicial').innerHTML = receptores.map(r => `<option value="${r}">${r}</option>`).join('');
        document.getElementById('estado').innerHTML = estados.map(e => `<option value="${e}">${e}</option>`).join('');
        document.getElementById('tipoServicio').innerHTML = tiposServicio.map(ts => `<option value="${ts}">${ts}</option>`).join('');

        // Cargar Asistentes Legales como opciones de lista desplegable con selección múltiple
        document.getElementById('asistentesLegales').innerHTML = abogados.map(a => `<option value="${a}">${a}</option>`).join('');
    } catch (e) {
        console.error("Error al cargar opciones de las listas desplegables: ", e);
    }
}

// Manejar el envío del formulario para agregar una nueva causa
newCauseForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    // Confirmar que la función se ejecuta
    console.log("Evento submit disparado para agregar una nueva causa.");

    // Verificar si el formulario y los elementos existen
    if (!newCauseForm) {
        console.error("No se encontró el formulario 'newCauseForm'.");
        return;
    }

    // Capturar los datos del formulario
    const asistentesLegalesElement = document.getElementById('asistentesLegales');
    if (!asistentesLegalesElement) {
        console.error("No se encontró el elemento 'asistentesLegales'.");
        return;
    }
    const asistentesLegalesSeleccionados = Array.from(asistentesLegalesElement.selectedOptions).map(option => option.value);

    // Obtener el RUT y el nombre del cliente seleccionado correctamente
    const clienteSelect = document.getElementById('cliente');
    if (!clienteSelect) {
        console.error("No se encontró el elemento 'cliente'.");
        return;
    }
    if (!clienteSelect.value) {
        alert("Por favor seleccione un cliente.");
        return;
    }
    
    // Capturar el valor correcto del RUT del cliente seleccionado
    const rutClienteSeleccionado = clienteSelect.value; // Esto toma el valor correcto del `value` en la opción seleccionada.
    const nombreClienteSeleccionado = clienteSelect.options[clienteSelect.selectedIndex].text; // Captura el nombre del cliente desde el texto de la opción.

    // Mensajes de consola para verificar el RUT y nombre del cliente
    console.log("RUT del cliente seleccionado:", rutClienteSeleccionado);
    console.log("Nombre del cliente seleccionado:", nombreClienteSeleccionado);

    // Capturar el valor del campo 'rol' de la nueva causa
    const rolElement = document.getElementById('rolCausa'); // Cambiado a 'rolCausa' para evitar conflictos
    if (!rolElement) {
        console.error("No se encontró el elemento 'rolCausa'.");
        return;
    }
    const rolValor = rolElement.value;

    // Verificar si el rol tiene un valor antes de proceder
    if (!rolValor || rolValor.trim() === "") {
        alert("Por favor ingrese un rol válido.");
        return; // No proceder si el rol está vacío
    }

    // Mensaje de consola para verificar el valor del rol
   // console.log("Valor del rol:", rolValor);

    // Crear el objeto de la nueva causa
    const nuevaCausa = {
        rut: rutClienteSeleccionado, // Guardar el RUT del cliente seleccionado
        nombre: nombreClienteSeleccionado, // Guardar el nombre del cliente seleccionado
        rol: rolValor, // Guardar el valor del rol ingresado
        fechaIngreso: document.getElementById('fechaIngreso').value,
        tribunal: document.getElementById('tribunal').value,
        abogadoResponsable: document.getElementById('abogadoResponsable').value,
        estado: document.getElementById('estado').value,
        tipoServicio: document.getElementById('tipoServicio').value,
        receptorJudicial: document.getElementById('receptorJudicial').value,
        abogadoCoordinador: document.getElementById('abogadoCoordinador').value,
        asistentesLegales: asistentesLegalesSeleccionados,
    };

    // Guardar la nueva causa en Firestore
    try {
        await addDoc(collection(db, "causas"), nuevaCausa);
       // console.log("Causa agregada con éxito.");

        // Cargar las causas nuevamente para actualizar la tabla
        loadCausas();
    } catch (e) {
        console.error("Error al agregar causa: ", e);
    }

    // Cerrar el modal y limpiar el formulario
    addCauseModal.style.display = 'none';
    newCauseForm.reset();
});


// Función para mostrar el modal reutilizado
function showModal(title, formContent, onSaveCallback) {
    document.getElementById('modalTitle').innerText = title;
    maintainerForm.innerHTML = formContent;
    maintainerForm.onsubmit = onSaveCallback;
    maintainerModal.style.display = 'block';
}


    /* ====================
       MODAL BOTON HONORARIOS 
       ==================== */

    // Abrir el modal de honorarios al hacer clic en el botón "Honorarios"
honorariosButton.addEventListener('click', function () {
    // Autocompletar los campos del modal de honorarios con la información ingresada en el formulario de "Agregar Nueva Causa"
    document.getElementById('nombreClienteHonorarios').value = document.getElementById('cliente').selectedOptions[0].text;
    document.getElementById('rolHonorarios').value = document.getElementById('rol').value;

    // Mostrar el modal de honorarios
    honorariosModal.style.display = 'block';
});

// Manejar el cambio en el tipo de documento
document.getElementById('tipoDocumento').addEventListener('change', function () {
    const tipoDocumento = this.value;
    const montoHonorarios = document.getElementById('montoHonorarios');

    if (tipoDocumento === "Nota de Crédito Electrónica") {
        // Cambiar el color del monto a rojo
        montoHonorarios.style.color = 'red';
    } else {
        // Restablecer el estilo del monto si no es "Nota de Crédito Electrónica"
        montoHonorarios.style.color = 'black';
    }
});

// Manejar el cambio en el tipo de documento
document.getElementById('tipoDocumento').addEventListener('change', function () {
    const tipoDocumento = this.value;
    const montoHonorarios = document.getElementById('montoHonorarios');

    if (tipoDocumento === "Nota de Crédito Electrónica") {
        // Cambiar el color del monto a rojo
        montoHonorarios.style.color = 'red';
    } else {
        // Restablecer el estilo del monto si no es "Nota de Crédito Electrónica"
        montoHonorarios.style.color = 'black';
    }
});

// Formatear el campo de monto para mostrar el signo de pesos
document.getElementById('montoHonorarios').addEventListener('input', function () {
    let valor = this.value.replace(/[^0-9]/g, ''); // Remover todos los caracteres que no sean números
    if (valor !== "") {
        valor = parseInt(valor, 10).toLocaleString('es-CL'); // Formatear con separadores de miles (Chile)
    }
    this.value = `$ ${valor}`; // Agregar el símbolo de pesos al inicio
});

// Manejar el evento de guardar honorarios
document.getElementById('honorariosForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Evitar el envío del formulario predeterminado

    const tipoDocumento = document.getElementById('tipoDocumento').value;
    let montoHonorarios = document.getElementById('montoHonorarios').value;

    // Quitar el signo de pesos y los separadores de miles para obtener el valor numérico
    montoHonorarios = montoHonorarios.replace(/[^0-9]/g, ''); // Remover cualquier carácter no numérico

    // Convertir el monto a negativo si es "Nota de Crédito Electrónica"
    if (tipoDocumento === "Nota de Crédito Electrónica") {
        montoHonorarios = -Math.abs(parseFloat(montoHonorarios));
    } else {
        montoHonorarios = parseFloat(montoHonorarios);
    }

    // Aquí puedes guardar los datos en tu base de datos
   // console.log("Tipo de Documento:", tipoDocumento);
   // console.log("Monto Honorarios:", montoHonorarios);

    // Restablecer el formulario después de guardar
    this.reset();
});










});


document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM completamente cargado y analizado.");

    const newCauseForm = document.getElementById('newCauseForm');
    if (newCauseForm) {
        console.log("Formulario 'newCauseForm' encontrado.");

        newCauseForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            console.log("Evento submit disparado para agregar una nueva causa.");

            // Capturar los datos del formulario aquí
            // ...
        });
    } else {
        console.error("No se encontró el formulario 'newCauseForm'.");
    }
});


window.loadCausas = loadCausas;


// Función para cargar y mostrar las causas en la tabla de resultados
async function loadCausas() {
    console.log("intento cargar")
    try {
        const causasSnapshot = await getDocs(collection(db, "causas"));
        resultsTableBody.innerHTML = ''; // Limpiar el contenido de la tabla antes de agregar nuevos datos

        // Construir las filas de la tabla con los datos obtenidos
        causasSnapshot.forEach((doc) => {
            const data = doc.data();
           // console.log(data); // Debug para verificar los datos
            if (data) {
                const row = `
                    <tr>
                        <td>${data.rut}</td>
                        <td>${data.nombre}</td>
                        <td>${data.rol}</td>
                        <td>${data.fechaIngreso}</td>
                        <td>${data.tribunal}</td>
                        <td>${data.abogadoResponsable}</td>
                        <td>${data.estado}</td>
                    </tr>
                `;
                resultsTableBody.innerHTML += row;
            }
        });

    

        // Si ya hay una instancia de DataTable, destrúyela primero
        if ($.fn.DataTable.isDataTable('#causasTable')) {
            $('#causasTable').DataTable().destroy();
        }

        // Inicializa DataTable después de agregar los datos
        $('#causasTable').DataTable({
            language: {
                emptyTable: "No hay datos disponibles en la tabla",
                lengthMenu: "Mostrar _MENU_ entradas",
                search: "Buscar:",
                info: "Mostrando _START_ a _END_ de _TOTAL_ entradas",
                paginate: {
                    first: "Primero",
                    last: "Último",
                    next: "Siguiente",
                    previous: "Anterior"
                }
            },
            columnDefs: [
                { targets: '_all', className: 'dt-center' } // Centrar todas las columnas
            ],
            order: [[0, 'asc']], // Ordenar por la primera columna por defecto
            responsive: true,    // Hacer que la tabla sea responsive
            destroy: true,       // Permitir la destrucción de la tabla para reinicializarla
        });
    } catch (e) {
        console.error("Error al cargar causas: ", e);
    }


};
