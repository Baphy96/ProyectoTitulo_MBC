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
        console.log('Botón "Agregar Nueva Causa" clicado');
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

    // Abrir el modal de honorarios al hacer clic en el botón "Honorarios"
    honorariosButton.addEventListener('click', function () {
        // Autocompletar los campos del modal de honorarios con la información ingresada en el formulario de "Agregar Nueva Causa"
        document.getElementById('rutClienteHonorarios').value = document.getElementById('cliente').value;
        document.getElementById('nombreClienteHonorarios').value = document.getElementById('cliente').selectedOptions[0].text;
        document.getElementById('rolHonorarios').value = document.getElementById('rol').value;

        honorariosModal.style.display = 'block';
    });

    /// Manejar clic en botones para agregar entidad desde "Agregar Nueva Causa"
    document.querySelectorAll('.add-button').forEach(button => {
        button.addEventListener('click', () => {
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
                <div class="form-row">
                    <label for="entityType">Tipo de Entidad:</label>
                    <select id="entityType" name="entityType" required>
                        <option value="Cliente">Cliente</option>
                        <option value="Abogado">Abogado</option>
                        <option value="Receptor Judicial">Receptor Judicial</option>
                        <option value="Abogado Coordinador">Abogado Coordinador</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="save-button">Guardar</button>              
                </div>
            `;

            showModal("Agregar Nueva Entidad", formContent, async function (event) {
                event.preventDefault();

                const nuevaEntidad = {
                    Rut: document.getElementById('entityRut').value,
                    Nombre: document.getElementById('entityName').value,
                    Direccion: document.getElementById('entityAddress').value,
                    Telefono: document.getElementById('entityPhone').value,
                    Correo: document.getElementById('entityEmail').value,
                    TipoEntidad: document.getElementById('entityType').value,
                };

                try {
                    await addDoc(collection(db, "Entidades"), nuevaEntidad);
                    console.log("Entidad agregada con éxito.");
                    maintainerModal.style.display = 'none';
                    maintainerForm.reset();
                } catch (e) {
                    console.error("Error al agregar la entidad: ", e);
                }
            });
        });
    });

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
                    clientes.push(data.Nombre);
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

            document.getElementById('cliente').innerHTML = clientes.map(c => `<option value="${c}">${c}</option>`).join('');
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

        // Capturar los datos del formulario
        const asistentesLegalesSeleccionados = Array.from(document.getElementById('asistentesLegales').selectedOptions).map(option => option.value);

        const nuevaCausa = {
            rut: document.getElementById('cliente').value,
            nombre: document.getElementById('cliente').selectedOptions[0].text,
            rol: document.getElementById('rol').value,
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
            console.log("Causa agregada con éxito.");
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
});
