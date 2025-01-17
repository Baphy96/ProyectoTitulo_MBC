import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, getDoc, query, where, setDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { db } from "../firebaseConfig.js";
import { checkUserRole } from './roleManager.js'; 

document.addEventListener('DOMContentLoaded', function () {
  // Verificar el rol del usuario y manejar los módulos visibles
  checkUserRole();

});

let honorariosTemporales = null; // Variable para almacenar los honorarios temporalmente

// Verificar el rol del usuario
const userRole = localStorage.getItem('userRole');
console.log("Rol del usuario:", userRole);

if (userRole !== "Administrador" && userRole !== "Asistente Administrativo" && userRole !== "Abogado") {
    alert("No tienes permiso para acceder a este módulo.");
}

document.addEventListener('DOMContentLoaded', function () {
    // Referencias a elementos del DOM
    const addCauseButton = document.getElementById('addCause');
    const addCauseModal = document.getElementById('addCauseModal');
    const closeModalButtons = document.querySelectorAll('.close');
    const newCauseForm = document.getElementById('newCauseForm');
    const honorariosButton = document.getElementById('honorariosButton');
    const honorariosModal = document.getElementById('honorariosModal');
    const honorariosForm = document.getElementById('honorariosForm');
    const maintainerModal = document.getElementById('maintainerModal');
    const maintainerForm = document.getElementById('maintainerForm');
    const resultsTableBody = document.getElementById('resultsTableBody');
    const searchForm = document.getElementById('searchForm');
    const startDateInput = document.getElementById('startDate'); // Input para la fecha de inicio
    const endDateInput = document.getElementById('endDate'); // Input para la fecha de fin
    const buscarButton = document.getElementById('buscar'); // Botón de búsqueda

  
    // Función para manejar restricciones de acceso según el rol del usuario
    function applyRolePermissions() {
        if (userRole === "Abogado") {
            // Desactivar botón de agregar causa
            if (addCauseButton) {
                addCauseButton.style.display = 'none';
            }

            // Desactivar acciones en la tabla (editar y eliminar)
            if (resultsTableBody) {
                const actionButtons = resultsTableBody.querySelectorAll('.edit-button, .delete-button');
                actionButtons.forEach(button => {
                    button.disabled = true;
                    button.style.pointerEvents = 'none';
                    button.classList.add('disabled');
                });
            }
        }
    }

    // Llamar a la función para aplicar restricciones de rol al cargar el contenido
    applyRolePermissions();

    // Eventos de manejo de acciones (solo si el usuario tiene permiso)
    if (userRole !== "Abogado") {
        addCauseButton.addEventListener('click', openAddCauseModal);
        honorariosButton.addEventListener('click', openHonorariosModal);
        honorariosForm.addEventListener('submit', submitHonorarios);
    }

  
    // Función para manejar cambios en los filtros
    function handleFilterChange() {
        const startDate = startDateInput.value || null;
        const endDate = endDateInput.value || null;

        // Llamar a `loadCausas` con las fechas actualizadas
        loadCausas(startDate, endDate);
    }

    // Asignar eventos a los filtros
    startDateInput.addEventListener('change', handleFilterChange);
    endDateInput.addEventListener('change', handleFilterChange);

    // Asignar evento al botón de búsqueda para ejecutar manualmente
    buscarButton.addEventListener('click', (event) => {
        event.preventDefault(); // Prevenir comportamiento por defecto del formulario
        const startDate = startDateInput.value || null;
        const endDate = endDateInput.value || null;

        // Llamar a `loadCausas` con las fechas actualizadas
        loadCausas(startDate, endDate);
    });



    // Evento para formatear el monto con separador de miles mientras se escribe
    document.getElementById('montoHonorarios').addEventListener('input', function (event) {
        const input = event.target;
        const value = input.value.replace(/[^0-9]/g, ''); // Eliminar caracteres no numéricos
        input.value = formatNumberWithThousandSeparator(value);
    });




    // Asigna eventos de clic para cerrar cada modal de forma independiente
    document.querySelector('.close-causa').addEventListener('click', function () {
        $('#addCauseModal').modal('hide');
    });

    document.querySelector('.close-cliente').addEventListener('click', function () {
        $('#maintainerModal').modal('hide');
    });

    document.querySelector('.close-honorarios').addEventListener('click', function () {
        $('#honorariosModal').modal('hide');
    });

    // Inicialización de Eventos
    addCauseButton.addEventListener('click', openAddCauseModal);
    window.addEventListener('click', closeModalOutside);    
    honorariosButton.addEventListener('click', openHonorariosModal);
    honorariosForm.addEventListener('submit', submitHonorarios);

    // Funciones de Manejo de Modales
    function openAddCauseModal() {
        newCauseForm.reset();
        newCauseForm.removeAttribute('data-id');

        // Cambia el título del modal
        document.querySelector("#addCauseModal .modal-title").innerText = "Agregar Nueva Causa";

        // Habilitar el campo cliente
        document.getElementById('cliente').removeAttribute('disabled');


        // Muestra el modal utilizando Bootstrap
        $('#addCauseModal').modal('show');

        loadDropdownOptions();
    }

    function closeModalOutside(event) {
        if (event.target === addCauseModal) $('#addCauseModal').modal('hide');
        if (event.target === honorariosModal) $('#honorariosModal').modal('hide');
        if (event.target === maintainerModal) $('#maintainerModal').modal('hide');
    }

    // Manejar clic en botones para agregar cliente desde "Agregar Nueva Causa"
    document.querySelectorAll('.add-button').forEach(button => {
        button.addEventListener('click', () => {
            // Mostrar el modal utilizando la función showModal
            showModal("Agregar Nuevo Cliente", getFormContent(), async function (event) {
                event.preventDefault();

                // Validar formulario antes de enviar
                if (!validateForm()) {
                    return;
                }

                // Capturar datos del formulario para la nueva entidad
                const nuevaEntidad = {
                    Rut: document.getElementById('entityRut').value,
                    Nombre: document.getElementById('entityName').value,
                    Direccion: document.getElementById('entityAddress').value,
                    Telefono: document.getElementById('entityPhone').value,
                    Correo: document.getElementById('entityEmail').value,
                    TipoEntidad: "Cliente"
                };

                try {
                    // Validar si el RUT ya existe con un nombre diferente
                    const isUnique = await validateUniqueRut(nuevaEntidad.Rut, nuevaEntidad.Nombre);
                    if (!isUnique) {
                        alert("El RUT ingresado ya existe con un nombre diferente en el sistema.");
                        return;
                    }
        
                    // Agregar la entidad al Firestore
                    await addDoc(collection(db, "Entidades"), nuevaEntidad);
                    alert("Entidad agregada con éxito.");

                    // Cerrar el modal y resetear el formulario
                    $('#maintainerModal').modal('hide');

                    // Añadir el nuevo cliente a la lista desplegable en "Agregar Nueva Causa"
                    const clienteSelect = document.getElementById('cliente');
                    if (clienteSelect) {
                        const option = document.createElement('option');
                        option.value = nuevaEntidad.Rut;
                        option.text = nuevaEntidad.Nombre;

                        // Insertar la nueva opción como la segunda en la lista
                        if (clienteSelect.children.length > 1) {
                            clienteSelect.insertBefore(option, clienteSelect.children[1]);
                        } else {
                            clienteSelect.appendChild(option);
                        }

                        // Establecer la nueva opción como seleccionada
                        clienteSelect.selectedIndex = 1;
                    }
                    // Volver a mostrar el modal de "Agregar Nueva Causa"
                    $('#addCauseModal').modal('show');
                } catch (e) {
                    console.error("Error al agregar el cliente: ", e);
                }
            });
        });
    });

    // Función para obtener el contenido del formulario de cliente
    function getFormContent() {
        return `
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
    }

    // Manejar clic en el botón de cierre ("X") del modal "Agregar Nuevo Cliente"
    document.querySelectorAll('#maintainerModal .close').forEach(button => {
        button.addEventListener('click', () => {
            // Cierra el modal "Agregar Nuevo Cliente" utilizando Bootstrap
            $('#maintainerModal').modal('hide');

            // Mostrar nuevamente el modal "Agregar Nueva Causa"
            $('#addCauseModal').modal('show');
        });
    });

    // Función showModal que muestra el modal y ejecuta el callback en el submit
    function showModal(title, content, submitCallback) {
        const modal = document.getElementById('maintainerModal');
        const modalContent = modal.querySelector('.modal-content');
        modal.querySelector('h5').innerText = title;
        modalContent.querySelector('form').innerHTML = content;

        // Mostrar el modal
        $('#maintainerModal').modal('show');

        // Añadir evento submit al formulario
        const form = modalContent.querySelector('form');
        form.addEventListener('submit', submitCallback);
    }

    // Funciones de Formulario y Validación
    function validateForm() {
        let isValid = true;
    
        // Obtener valores del formulario
        const rut = document.getElementById('entityRut').value;
        const nombre = document.getElementById('entityName').value;
        const direccion = document.getElementById('entityAddress').value;
        const telefono = document.getElementById('entityPhone').value;
        const correo = document.getElementById('entityEmail').value;
    
        // Validación del RUT
        if (!/^[0-9]{7,8}-[0-9kK]$/.test(rut) || !validateRut(rut)) {
            alert('RUT inválido. Debe seguir el formato 12345678-K.');
            isValid = false;
        }
    
        // Validación del Nombre
        if (nombre.trim().length < 3) {
            alert('El nombre es requerido y debe tener al menos 3 caracteres.');
            isValid = false;
        }
    
        // Validación de la Dirección
        if (direccion.trim().length < 5) {
            alert('La dirección es requerida y debe tener al menos 5 caracteres.');
            isValid = false;
        }
    
        // Validación del Teléfono
        if (!/^[0-9]{9}$/.test(telefono)) {
            alert('El teléfono debe tener 9 dígitos.');
            isValid = false;
        }
    
        // Validación del Correo Electrónico
        if (!/\S+@\S+\.\S+/.test(correo)) {
            alert('Correo inválido. Por favor ingrese un correo electrónico válido.');
            isValid = false;
        }
    
        // Validación del RUT único con el mismo nombre
        if (!validateUniqueRut(rut, nombre)) {
            alert('El RUT ingresado ya existe con un nombre diferente en el sistema.');
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

// Validación para asegurar que el RUT no se ingrese dos veces con distinto nombre
async function validateUniqueRut(rut, nombre) {
    try {
        const q = query(collection(db, "Entidades"), where("Rut", "==", rut));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docData = querySnapshot.docs[0].data();
            if (docData.Nombre !== nombre) {
                // El RUT existe pero con un nombre diferente
                return false;
            }
        }
        return true; // No hay conflicto
    } catch (e) {
        console.error("Error al validar el RUT único:", e);
        return false; // Asumir conflicto en caso de error
    }
}


    async function loadDropdownOptions() {
        try {
            // Cargar las opciones de la colección "Entidades" para varios tipos
            const entidadesSnapshot = await getDocs(collection(db, "Entidades"));
            const clientes = [];
            const abogados = [];
            const receptores = [];
            const abogadosCoordinadores = [];

            entidadesSnapshot.forEach((doc) => {
                const data = doc.data();
                switch (data.TipoEntidad) {
                    case "Cliente":
                        clientes.push({ Rut: data.Rut, Nombre: data.Nombre });
                        break;
                    case "Abogado":
                        abogados.push(data.Nombre);
                        break;
                    case "Receptor Judicial":
                        receptores.push(data.Nombre);
                        break;
                    case "Abogado Coordinador":
                        abogadosCoordinadores.push(data.Nombre);
                        break;
                    default:
                        break;
                }
            });

            // Cargar la colección "Tribunales"
            const tribunalesSnapshot = await getDocs(collection(db, "Tribunales"));
            const tribunales = tribunalesSnapshot.docs.map(doc => doc.data().Descripcion);

            // Cargar la colección "TipoServicio"
            const tiposServicioSnapshot = await getDocs(collection(db, "TipoServicio"));
            const tiposServicio = tiposServicioSnapshot.docs.map(doc => doc.data().Descripcion);

            // Cargar la colección "EstadoJudicial"
            const estadosSnapshot = await getDocs(collection(db, "EstadoJudicial"));
            const estados = estadosSnapshot.docs.map(doc => doc.data().Descripcion);

            // Poblar listas desplegables
            document.getElementById('cliente').innerHTML = `
                <option value="" disabled selected>Seleccione cliente</option>
                ${clientes.map(cliente => `<option value="${cliente.Rut}">${cliente.Nombre}</option>`).join('')}
            `;

            document.getElementById('tribunal').innerHTML = `
                <option value="" disabled selected>Seleccione tribunal</option>
                ${tribunales.map(t => `<option value="${t}">${t}</option>`).join('')}
            `;

            document.getElementById('abogadoResponsable').innerHTML = `
                <option value="" disabled selected>Seleccione abogado responsable</option>
                ${abogados.map(a => `<option value="${a}">${a}</option>`).join('')}
            `;

            document.getElementById('abogadoCoordinador').innerHTML = `
                <option value="" disabled selected>Seleccione abogado coordinador</option>
                ${abogadosCoordinadores.map(ac => `<option value="${ac}">${ac}</option>`).join('')}
            `;

            document.getElementById('receptorJudicial').innerHTML = `
                <option value="" disabled selected>Seleccione receptor judicial</option>
                ${receptores.map(r => `<option value="${r}">${r}</option>`).join('')}
            `;

            document.getElementById('estado').innerHTML = `
                <option value="" disabled selected>Seleccione estado</option>
                ${estados.map(e => `<option value="${e}">${e}</option>`).join('')}
            `;

            document.getElementById('tipoServicio').innerHTML = `
                <option value="" disabled selected>Seleccione tipo de servicio</option>
                ${tiposServicio.map(ts => `<option value="${ts}">${ts}</option>`).join('')}
            `;

            // Ordenar alfabéticamente la lista de abogados para los checkboxes de Asistentes Legales
            abogados.sort((a, b) => a.localeCompare(b));

            // Crear checkboxes para Asistentes Legales en un div, alineados correctamente en una sola línea
            document.getElementById('asistentesLegalesContainer').innerHTML = abogados.map(a =>
                `<div style="display: flex; align-items: center; margin-bottom: 5px;">
                <input type="checkbox" id="asistente_${a}" name="asistentesLegales" value="${a}" style="margin-right: 10px;">
                <label for="asistente_${a}" style="margin: 0;">${a}</label>
                </div>`
            ).join('');

        } catch (e) {
            console.error("Error al cargar opciones de las listas desplegables:", e);
        }
    }

    // Función para editar una causa existente
    window.editarCausa = async function (id) {
        try {
            // Limpiar el formulario antes de cargar nuevos datos
            newCauseForm.reset();
            honorariosForm.reset();
            honorariosForm.removeAttribute('data-honorario-id');
            newCauseForm.removeAttribute('data-cause-id');

            // Obtener el documento de la causa para extraer los datos
            const docRef = doc(db, "causas", id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const causa = docSnap.data();

                // Abrir el modal para edición y cambiar el título
                openAddCauseModal();

                // Asigna el ID de la causa al formulario para indicar que estamos en modo edición
                newCauseForm.setAttribute('data-cause-id', id);

                // Deshabilitar el campo cliente para evitar ediciones
                document.getElementById('cliente').setAttribute('disabled', 'true');

                // Cargar opciones de listas desplegables antes de establecer valores
                await loadDropdownOptions();
                document.querySelector("#addCauseModal h5").innerText = `Editar Causa Rol ${causa.rol}`;

                // Asignar valores de la causa a los campos del formulario
                document.getElementById('cliente').value = causa.rut || "";
                document.getElementById('rolCausa').value = causa.rol || "";
                document.getElementById('fechaIngreso').value = causa.fechaIngreso || "";
                document.getElementById('tribunal').value = causa.tribunal || "";
                document.getElementById('abogadoResponsable').value = causa.abogadoResponsable || "";
                document.getElementById('estado').value = causa.estado || "";
                document.getElementById('tipoServicio').value = causa.tipoServicio || "";
                document.getElementById('receptorJudicial').value = causa.receptorJudicial || "";
                document.getElementById('abogadoCoordinador').value = causa.abogadoCoordinador || "";
                document.getElementById('demandado').value = causa.demandado || "";

                // Asignar valores a asistentes legales como checkboxes
                Array.from(document.querySelectorAll('input[name="asistentesLegales"]')).forEach(checkbox => {
                    checkbox.checked = causa.asistentesLegales && causa.asistentesLegales.includes(checkbox.value);
                });

                // Cargar y asignar datos de los honorarios si existen
                const honorariosSnapshot = await getDocs(query(collection(db, "honorarios"), where("rol", "==", causa.rol)));

                if (!honorariosSnapshot.empty) {
                    // Detectar múltiples registros para el mismo rol
                    if (honorariosSnapshot.docs.length > 1) {
                        console.warn(`Se encontraron múltiples honorarios para el rol: ${causa.rol}`);
                        alert(`Advertencia: Se encontraron múltiples registros de honorarios para el rol ${causa.rol}. Usando el primero encontrado.`);
                    }

                    // Usar el primer registro encontrado
                    const honorariosData = honorariosSnapshot.docs[0].data();
                    const honorariosId = honorariosSnapshot.docs[0].id;

                    // Asignar valores al formulario de honorarios
                    document.getElementById('rolHonorarios').value = honorariosData.rol || "";
                    document.getElementById('tipoDocumento').value = honorariosData.tipoDocumento || "";
                    document.getElementById('numeroDocumento').value = honorariosData.numeroDocumento || "";
                    document.getElementById('fechaDocumento').value = honorariosData.fechaDocumento || "";
                    document.getElementById('montoHonorarios').value = honorariosData.monto || "";

                    // Guardar el ID de honorarios en el formulario para actualizarlo después
                    honorariosForm.setAttribute('data-honorario-id', honorariosId);
                } else {
                    console.warn("No se encontraron honorarios para el rol actual.");
                    alert("No se encontraron honorarios asociados a esta causa. Puede que sean nuevos o hayan sido eliminados.");
                    honorariosForm.reset();
                    honorariosForm.setAttribute('data-honorario-id', ""); // Limpiar cualquier referencia previa
                }
            } else {
                console.log("No se encontró la causa con el ID proporcionado.");
                alert("La causa no se encontró. Por favor, verifique si aún existe.");
            }
        } catch (e) {
            console.error("Error obteniendo causa para editar:", e);
            alert("Hubo un error al obtener los datos de la causa. Por favor, intente de nuevo.");
        }
    };


    // Función para guardar los cambios de la edición o agregar una nueva causa
    newCauseForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Obtener el ID del documento a editar desde el atributo `data-cause-id`
        const id = newCauseForm.getAttribute('data-cause-id');  // Verifica si es una edición
        const rutCliente = document.getElementById('cliente').value;
        const rolCausa = document.getElementById('rolCausa').value;
        // Verifica si hay alguna opción seleccionada y asigna el nombre correspondiente
        const nombreCliente = document.getElementById('cliente').selectedOptions.length > 0
            ? document.getElementById('cliente').selectedOptions[0].text
            : "";

        if (!rutCliente || !rolCausa) {
            alert("Por favor complete todos los campos obligatorios.");
            return;
        }

        // Capturar datos del formulario de la causa
        const updatedCause = {
            rut: rutCliente,
            rol: rolCausa,
            nombre: nombreCliente,  // Asegúrate de asignar el nombre del cliente aquí
            fechaIngreso: document.getElementById('fechaIngreso').value,
            tribunal: document.getElementById('tribunal').value,
            abogadoResponsable: document.getElementById('abogadoResponsable').value,
            estado: document.getElementById('estado').value,
            tipoServicio: document.getElementById('tipoServicio').value,
            receptorJudicial: document.getElementById('receptorJudicial').value,
            abogadoCoordinador: document.getElementById('abogadoCoordinador').value,
            demandado: document.getElementById('demandado').value,
            asistentesLegales: Array.from(document.querySelectorAll('input[name="asistentesLegales"]:checked')).map(checkbox => checkbox.value)
        };

        try {
            if (id) {
                // Aquí agregamos el código para eliminar honorarios con el rol antiguo
                const oldCauseDoc = await getDoc(doc(db, "causas", id));
                const oldCauseData = oldCauseDoc.data();

                if (oldCauseData && oldCauseData.rol !== updatedCause.rol) {
                    const honorariosRef = collection(db, "honorarios");
                    const oldHonorariosSnapshot = await getDocs(query(honorariosRef, where("rol", "==", oldCauseData.rol)));

                    if (!oldHonorariosSnapshot.empty) {
                        for (const doc of oldHonorariosSnapshot.docs) {
                            await deleteDoc(doc.ref); // Eliminar cada honorario relacionado con el rol antiguo
                        }
                    }
                }

                // Actualizar la causa existente
                const causeRef = doc(db, "causas", id);
                await updateDoc(causeRef, updatedCause);
                alert("Causa actualizada con éxito.");
            } else {
                // Si no hay ID, agregar una nueva causa
                await addDoc(collection(db, "causas"), updatedCause);
                alert("Causa agregada con éxito.");
            }

            // Manejar los honorarios temporales si existen
            if (honorariosTemporales) {
                honorariosTemporales.rol = updatedCause.rol;
                honorariosTemporales.rutCliente = updatedCause.rut; // Asegúrate de usar el RUT del cliente de la causa
                honorariosTemporales.nombreCliente = updatedCause.nombre; // Asegúrate de usar el nombre del cliente de la causa


                const honorariosRef = collection(db, "honorarios");
                const querySnapshot = await getDocs(query(honorariosRef, where("rol", "==", honorariosTemporales.rol)));

                if (!querySnapshot.empty) {
                    if (querySnapshot.docs.length > 1) {
                        console.warn(`Se encontraron múltiples registros de honorarios para el rol: ${honorariosTemporales.rol}`);
                        alert(`Advertencia: Se encontraron múltiples registros para el rol ${honorariosTemporales.rol}. Actualizando el primero.`);
                    }

                    // Actualizar el primer honorario encontrado
                    const honorarioDoc = querySnapshot.docs[0];
                    await updateDoc(honorarioDoc.ref, honorariosTemporales);

                    // Opcional: Eliminar otros duplicados (si existen)
                    if (querySnapshot.docs.length > 1) {
                        for (let i = 1; i < querySnapshot.docs.length; i++) {
                            await deleteDoc(querySnapshot.docs[i].ref);
                        }
                    }
                } else {
                    // Agregar nuevos honorarios
                    await addDoc(honorariosRef, honorariosTemporales);
                }
                honorariosTemporales = null; // Limpiar la variable después de guardar
            }

            // Cerrar el modal y limpiar el formulario
            newCauseForm.removeAttribute('data-cause-id');
            $('#addCauseModal').modal('hide');
            newCauseForm.reset();

            // Recargar la tabla de causas para mostrar los cambios
            loadCausas();
        } catch (e) {
            console.error("Error al actualizar la causa y/o honorarios:", e);
            alert("Hubo un error al actualizar la causa y/o honorarios. Por favor, intente de nuevo.");
        }

        // Recargar la tabla de honorarios para reflejar los cambios
        if (typeof loadHonorarios === 'function') {
            await loadHonorarios();
        }
    });


    // Funciones para Honorarios
    async function openHonorariosModal() {
        const rolCausa = document.getElementById('rolCausa').value;
        if (!rolCausa) {
            alert("Por favor ingrese un rol válido antes de agregar honorarios.");
            return;
        }

        $('#honorariosModal').modal('show');
        document.getElementById('nombreClienteHonorarios').value = document.getElementById('cliente').selectedOptions[0].text;
        document.getElementById('rolHonorarios').value = rolCausa;

        // Muestra el modal utilizando Bootstrap
        $('#honorariosModal').modal('show');

        $('#honorariosModal').modal('hide');
    }

    function submitHonorarios(event) {
        event.preventDefault();

        const clienteElement = document.getElementById('cliente');
        const rutCliente = clienteElement.value;
        const nombreCliente = clienteElement.options[clienteElement.selectedIndex]?.text || "";

        // Capturar los valores de los campos del formulario de honorarios
        honorariosTemporales = {
            rol: document.getElementById('rolHonorarios').value,
            tipoDocumento: document.getElementById('tipoDocumento').value,
            numeroDocumento: document.getElementById('numeroDocumento').value,
            fechaDocumento: document.getElementById('fechaDocumento').value,
            monto: parseNumberWithoutSeparator(document.getElementById('montoHonorarios').value) // Eliminar separadores antes de guardar
        };

        // Validación para asegurar que los campos obligatorios están completos
        if (!honorariosTemporales.rol || !honorariosTemporales.tipoDocumento || !honorariosTemporales.numeroDocumento || !honorariosTemporales.fechaDocumento || isNaN(honorariosTemporales.monto)) {
            alert("Por favor complete todos los campos obligatorios de honorarios.");
            honorariosTemporales = null; // No almacenar datos incompletos
            return;
        }

        alert("Honorarios guardados temporalmente. Se guardarán junto con la causa.");

        // Cerrar el modal y limpiar el formulario de honorarios
        $('#honorariosModal').modal('hide');
        honorariosForm.reset();
    }

    // Recalcular y recargar honorarios al cerrar el modal
    $('#honorariosModal').on('hidden.bs.modal', async function () {
        if (typeof loadHonorarios === 'function') {
            await loadHonorarios(); // Recargar la tabla de honorarios al cerrar el modal
        }
    });



    // Función para formatear número con separadores de miles
    function formatNumberWithThousandSeparator(value) {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    // Función para eliminar separadores antes de guardar el valor
    function parseNumberWithoutSeparator(value) {
        return parseFloat(value.replace(/\./g, ''));
    }

    // Función para Cargar y Mostrar Causas
    async function loadCausas(startDate = null, endDate = null) {
        try {
            console.log("Iniciando carga de causas...");
    
            // Verifica y destruye cualquier instancia previa de DataTable
            if ($.fn.DataTable.isDataTable('#causasTable')) {
                console.log("Reinicializando DataTable...");
                $('#causasTable').DataTable().clear().destroy();
                $('#causasTable tbody').empty();
            }
    
            // Construir la consulta con los filtros aplicados
            let causasQuery = collection(db, "causas");
            console.log("Consulta inicial construida...");
    
            if (startDate) {
                causasQuery = query(causasQuery, where("fechaIngreso", ">=", startDate));
                console.log(`Filtro aplicado: fechaIngreso >= ${startDate}`);
            }
            if (endDate) {
                causasQuery = query(causasQuery, where("fechaIngreso", "<=", endDate));
                console.log(`Filtro aplicado: fechaIngreso <= ${endDate}`);
            }
    
            // Ejecutar la consulta
            const causasSnapshot = await getDocs(causasQuery);
            console.log("Documentos obtenidos de Firestore:", causasSnapshot.docs.map(doc => doc.data()));
    
            if (causasSnapshot.empty) {
                console.warn("No se encontraron documentos en la consulta.");
                alert("No se encontraron causas para los filtros aplicados.");
                return;
            }
    
            const rows = [];
    
            // Procesar cada documento en la consulta
            for (const causaDoc of causasSnapshot.docs) {
                const causaData = causaDoc.data();
                console.log(`Procesando causa: ${JSON.stringify(causaData)}`);
    
                // Formatea la fecha en formato dd-mm-aaaa
                const fecha = causaData.fechaIngreso
                    ? new Date(causaData.fechaIngreso).toLocaleDateString("es-CL", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric", // Año completo
                    })
                    : "N/A";
    
                // Obtener datos de honorarios asociados
                let honorariosValue = "Sin Honorarios";
                try {
                    const honorariosSnapshot = await getDocs(
                        query(collection(db, "honorarios"), where("rol", "==", causaData.rol))
                    );
                    console.log(`Documentos encontrados en 'honorarios' para rol ${causaData.rol}: ${honorariosSnapshot.size}`);
    
                    if (!honorariosSnapshot.empty) {
                        const honorariosData = honorariosSnapshot.docs[0].data();
                        console.log(`Honorarios asociados: ${JSON.stringify(honorariosData)}`);
                        honorariosValue = honorariosData.monto
                            ? `$${formatNumberWithThousandSeparator(honorariosData.monto)}`
                            : "Sin Honorarios";
                    }
                } catch (error) {
                    console.warn(`Error al obtener honorarios para rol ${causaData.rol}:`, error);
                }
    
                // Construir la fila para la tabla
                const acciones =
                    userRole !== "Abogado"
                        ? `<button class="edit-button" onclick="editarCausa('${causaDoc.id}')">✏️</button>
                           <button class="delete-button" onclick="eliminarCausa('${causaDoc.id}')">🗑️</button>`
                        : `<button class="edit-button" disabled style="pointer-events: none;">✏️</button>`;
    
                rows.push([
                    causaData.rut || "N/A",
                    causaData.nombre || "N/A",
                    causaData.rol || "N/A",
                    fecha,
                    causaData.tribunal || "N/A",
                    causaData.abogadoResponsable || "N/A",
                    causaData.tipoServicio || "N/A",
                    honorariosValue,
                    causaData.estado || "N/A",
                    acciones,
                ]);
            }
    
            console.log("Filas generadas para DataTable:", rows);
    
            // Inicializar DataTable
            $('#causasTable').DataTable({
                data: rows,
                columns: [
                    { title: "RUT Cliente" },
                    { title: "Nombre Cliente" },
                    { title: "ROL / Año" },
                    { title: "Fecha de Ingreso" },
                    { title: "Tribunal" },
                    { title: "Abogado Responsable" },
                    { title: "Tipo de Servicio" },
                    { title: "Honorarios" },
                    { title: "Estado" },
                    { title: "Acciones" },
                ],
                destroy: true,
                language: {
                    emptyTable: "No hay datos disponibles en la tabla",
                    lengthMenu: "Mostrar _MENU_ entradas",
                    search: "Búsqueda avanzada:",
                    info: "Mostrando _START_ a _END_ de _TOTAL_ entradas",
                    paginate: {
                        first: "Primero",
                        last: "Último",
                        next: "Siguiente",
                        previous: "Anterior",
                    },
                },
                columnDefs: [{ targets: "_all", className: "dt-center" }],
                order: [[0, "asc"]],
                responsive: true,
                autoWidth: false,
            });
    
            console.log("DataTable inicializada correctamente.");
        } catch (error) {
            console.error("Error al cargar causas: ", error);
            alert("Hubo un error al cargar las causas. Por favor, intente de nuevo.");
        }
    }
    


    // Función para eliminar una causa
    window.eliminarCausa = async function (id) {
        const confirmacion = confirm("¿Estás seguro de que deseas eliminar esta causa?");
        if (confirmacion) {
            try {
                // Obtener el documento de la causa para extraer el rol
                const docRef = doc(db, "causas", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const causa = docSnap.data();
                    const rolCausa = causa.rol;

                    // Buscar y eliminar honorarios asociados con el rol de la causa
                    const honorariosSnapshot = await getDocs(query(collection(db, "honorarios"), where("rol", "==", rolCausa)));
                    for (const honorarioDoc of honorariosSnapshot.docs) {
                        await deleteDoc(doc(db, "honorarios", honorarioDoc.id));
                    }

                    // Eliminar la causa después de eliminar los honorarios
                    await deleteDoc(docRef);
                    alert("Causa y honorarios asociados eliminados con éxito.");

                    // Eliminar la fila de la causa directamente del DOM
                    const row = document.querySelector(`tr[data-id='${id}']`);
                    if (row) {
                        row.remove();
                    }
                } else {
                    console.log("No se encontró la causa con el ID proporcionado.");
                    alert("La causa ya no existe.");
                }
            // Recargar la tabla de causas
            await loadCausas(); // Asegúrate de que esta función esté implementada correctamente
        } catch (e) {
            console.error("Error al eliminar la causa y/o honorarios:", e);
            alert("Hubo un error al eliminar la causa. Por favor, inténtelo de nuevo.");
        }
    }
};


    // Cargar causas al iniciar
    loadCausas();

});


