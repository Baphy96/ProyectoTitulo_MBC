import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { db } from "../firebaseConfig.js";

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

    // Inicialización de Eventos
    addCauseButton.addEventListener('click', openAddCauseModal);
    closeModalButtons.forEach(button => button.addEventListener('click', closeModals));
    window.addEventListener('click', closeModalOutside);
    newCauseForm.addEventListener('submit', submitNewCause);
    honorariosButton.addEventListener('click', openHonorariosModal);
    honorariosForm.addEventListener('submit', submitHonorarios);

    // Funciones de Manejo de Modales
    function openAddCauseModal() {
        newCauseForm.reset();
        newCauseForm.removeAttribute('data-id');
        addCauseModal.style.display = 'block';
        document.querySelector("#addCauseModal h2").innerText = "Agregar Nueva Causa";
        loadDropdownOptions();
    }

    function closeModals() {
        addCauseModal.style.display = 'none';
        honorariosModal.style.display = 'none';
        maintainerModal.style.display = 'none';
        newCauseForm.reset();
        newCauseForm.removeAttribute('data-id');
    }

    function closeModalOutside(event) {
        if (event.target === addCauseModal) addCauseModal.style.display = 'none';
        if (event.target === honorariosModal) honorariosModal.style.display = 'none';
    }

    // Funciones de Formulario y Validación
    function validateForm() {
        let isValid = true;

        // Validación del RUT
        const rut = document.getElementById('entityRut').value;
        if (!/^[0-9]{7,8}-[0-9kK]$/.test(rut) || !validateRut(rut)) {
            alert('RUT inválido. Debe seguir el formato 12345678-K.');
            isValid = false;
        }

        // Validación del Nombre
        const nombre = document.getElementById('entityName').value;
        if (nombre.trim().length < 3) {
            alert('El nombre es requerido y debe tener al menos 3 caracteres.');
            isValid = false;
        }

        // Validación de la Dirección
        const direccion = document.getElementById('entityAddress').value;
        if (direccion.trim().length < 5) {
            alert('La dirección es requerida y debe tener al menos 5 caracteres.');
            isValid = false;
        }

        // Validación del Teléfono
        const telefono = document.getElementById('entityPhone').value;
        if (!/^[0-9]{9}$/.test(telefono)) {
            alert('El teléfono debe tener 9 dígitos.');
            isValid = false;
        }

        // Validación del Correo Electrónico
        const correo = document.getElementById('entityEmail').value;
        if (!/\S+@\S+\.\S+/.test(correo)) {
            alert('Correo inválido. Por favor ingrese un correo electrónico válido.');
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

    async function submitNewCause(event) {
        event.preventDefault();
    
        // Obtener y validar campos obligatorios
        const rutCliente = document.getElementById('cliente').value;
        const rolCausa = document.getElementById('rolCausa').value;
        const nombrecliente = document.getElementById('cliente').selectedOptions[0].text;
        if (!rutCliente || !rolCausa) {
            alert("Por favor complete todos los campos obligatorios.");
            return;
        }
    
        // Capturar valores de otros campos del formulario
        const newCause = {
            demandado: document.getElementById('demandado').value,
            nombre: nombrecliente,
            rut: rutCliente,
            rol: rolCausa,
            fechaIngreso: document.getElementById('fechaIngreso').value,
            tribunal: document.getElementById('tribunal').value,
            abogadoResponsable: document.getElementById('abogadoResponsable').value,
            estado: document.getElementById('estado').value,
            tipoServicio: document.getElementById('tipoServicio').value,
            receptorJudicial: document.getElementById('receptorJudicial').value,
            abogadoCoordinador: document.getElementById('abogadoCoordinador').value,
            asistentesLegales: Array.from(document.querySelectorAll('input[name="asistentesLegales"]:checked')).map(checkbox => checkbox.value)
        };

        try {
            // Agregar la nueva causa en Firestore
            await addDoc(collection(db, "causas"), newCause);
            alert("Causa agregada con éxito.");
    
            // Cerrar el modal y resetear el formulario
            addCauseModal.style.display = 'none';
            newCauseForm.reset();
    
            // Recargar la tabla de causas para mostrar la nueva entrada
            loadCausas();
        } catch (e) {
            console.error("Error al agregar causa:", e);
            alert("Ocurrió un error al agregar la causa. Intente de nuevo.");
        }
    }

    // Funciones para Honorarios
    async function openHonorariosModal() {
        const rolCausa = document.getElementById('rolCausa').value;
        if (!rolCausa) {
            alert("Por favor ingrese un rol válido antes de agregar honorarios.");
            return;
        }

        honorariosModal.style.display = 'block';
        document.getElementById('nombreClienteHonorarios').value = document.getElementById('cliente').selectedOptions[0].text;
        document.getElementById('rolHonorarios').value = rolCausa;
    }

    async function submitHonorarios(event) {
        event.preventDefault();
    
        // Capturar los valores de los campos del formulario de honorarios
        const honorarios = {
            rol: document.getElementById('rolHonorarios').value,
            tipoDocumento: document.getElementById('tipoDocumento').value,
            numeroDocumento: document.getElementById('numeroDocumento').value,
            fechaDocumento: document.getElementById('fechaDocumento').value,
            monto: parseFloat(document.getElementById('montoHonorarios').value.replace(/[^0-9]/g, ''))
        };
    
        // Validación para asegurar que los campos obligatorios están completos
        if (!honorarios.rol || !honorarios.tipoDocumento || !honorarios.numeroDocumento || !honorarios.fechaDocumento || isNaN(honorarios.monto)) {
            alert("Por favor complete todos los campos obligatorios de honorarios.");
            return;
        }
    
        try {
            // Agregar el registro de honorarios en Firestore
            await addDoc(collection(db, "honorarios"), honorarios);
            alert("Honorarios agregados con éxito.");
    
            // Cerrar el modal y limpiar el formulario de honorarios
            honorariosModal.style.display = 'none';
            honorariosForm.reset();
        } catch (e) {
            console.error("Error al agregar honorarios:", e);
            alert("Ocurrió un error al agregar los honorarios. Intente de nuevo.");
        }
    }

    // Función para Cargar y Mostrar Causas
    async function loadCausas() {
        try {
            const causasSnapshot = await getDocs(collection(db, "causas"));
            resultsTableBody.innerHTML = ''; // Limpiar tabla antes de añadir nuevas filas

            causasSnapshot.forEach(doc => {
                const data = doc.data();
                const row = `
                    <tr data-id="${doc.id}">
                        <td>${data.rut}</td>
                        <td>${data.nombre}</td>
                        <td>${data.rol}</td>
                        <td>${data.fechaIngreso}</td>
                        <td>${data.tribunal}</td>
                        <td>${data.abogadoResponsable}</td>
                        <td>${data.estado}</td>
                        <td>
                            <button onclick="editarCausa('${doc.id}')">Editar</button>
                            <button onclick="eliminarCausa('${doc.id}')">Eliminar</button>
                        </td>
                    </tr>
                `;
                resultsTableBody.innerHTML += row;
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
    }

   // Funciones de Edición y Eliminación
   window.editarCausa = async function (id) {
    try {
        const docRef = doc(db, "causas", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          
            const causa = docSnap.data();
            console.log("Datos de la causa:", causa);
            // Abrir el modal para edición y cambiar el título
            openAddCauseModal();
            document.querySelector("#addCauseModal h2").innerText =  `Editar Causa Rol ${causa.rol} `;

            // Asignar valores de la causa a los campos del formulario después de que se carguen las opciones
            setTimeout(() => {
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
            }, 1500);

            // Guardar el ID de la causa en el formulario para actualizarla después
            newCauseForm.setAttribute('data-id', id);
        } else {
            console.log("No se encontró la causa con el ID proporcionado");
        }
    } catch (e) {
        console.error("Error obteniendo causa para editar:", e);
    }
};

// Función para guardar los cambios de la edición
newCauseForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const id = newCauseForm.getAttribute('data-id'); // Obtener el ID de la causa a editar
    if (!id) return; // Si no hay ID, no procede con la actualización

    // Capturar datos del formulario
    const updatedCause = {
        rut: document.getElementById('cliente').value,
        rol: document.getElementById('rolCausa').value,
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
        // Actualizar la causa en Firestore
        await updateDoc(doc(db, "causas", id), updatedCause);
        alert("Causa actualizada con éxito.");

        // Cerrar el modal y limpiar el formulario
        addCauseModal.style.display = 'none';
        newCauseForm.reset();

        // Recargar la tabla de causas para mostrar los cambios
        loadCausas();
    } catch (e) {
        console.error("Error al actualizar la causa:", e);
    }
});
    
    // Función para eliminar una causa
    window.eliminarCausa = async function (id) {
        const confirmacion = confirm("¿Estás seguro de que deseas eliminar esta causa?");
        if (confirmacion) {
            try {
                await deleteDoc(doc(db, "causas", id));
                alert("Causa eliminada con éxito.");
    
                // Eliminar la fila de la causa directamente del DOM
                const row = document.querySelector(`tr[data-id='${id}']`);
                if (row) {
                    row.remove();
                }
            } catch (e) {
                console.error("Error al eliminar la causa:", e);
            }
        }
    };

    // Cargar causas al iniciar
    loadCausas();
});
