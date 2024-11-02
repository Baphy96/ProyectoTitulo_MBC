


import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { app, auth, db } from "../firebaseConfig.js";



document.addEventListener('DOMContentLoaded', function () {
    // Referencias a botones y elementos del DOM
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const addEntityButton = document.getElementById('addEntity');
    const addServiceTypeButton = document.getElementById('addServiceType');
    const addCourtButton = document.getElementById('addCourt');
    const addStateButton = document.getElementById('addState');
    const maintainerModal = document.getElementById('maintainerModal');
    const maintainerForm = document.getElementById('maintainerForm');
    const closeModalButton = document.querySelector('.close');

    // Referencias a las tablas de cada sección
    const serviceTypeTableBody = document.getElementById('serviceTypeTableBody');
    const courtTableBody = document.getElementById('courtTableBody');
    const stateTableBody = document.getElementById('stateTableBody');
    const entityTableBody = document.getElementById('entityTableBody')

    // Referencias a campos de búsqueda
    const searchServiceInput = document.getElementById('serviceSearch');
    const searchCourtInput = document.getElementById('courtSearch');
    const searchStateInput = document.getElementById('stateSearch');
    const searchEntityInput = document.getElementById('entitySearch');

    // Manejar clic en las pestañas
    tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remover la clase "active" de todas las pestañas y contenidos
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Agregar la clase "active" a la pestaña seleccionada y su contenido correspondiente
        button.classList.add('active');
        const tabId = button.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');

        // Cargar datos al cambiar de pestaña si es necesario
        if (tabId === 'tipos-servicio') {
            loadServiceTypes();
        } else if (tabId === 'tribunales') {
            loadCourts();
        } else if (tabId === 'estados') {
            loadStates();
        } else if (tabId === 'entidades') {
            // Agregar la lógica de carga de entidades aquí si es necesario
        }
    });
    });

    // Inicializar mostrando la pestaña activa por defecto
    const activeButton = document.querySelector('.tab-button.active');
    if (activeButton) {
        const tabId = activeButton.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    }

    // Mostrar el modal para agregar o editar un registro
    function showModal(title, formContent, onSaveCallback) {
        document.getElementById('modalTitle').innerText = title;
        maintainerForm.innerHTML = formContent;
        maintainerForm.onsubmit = onSaveCallback;
        maintainerModal.style.display = 'block';
    }

    // Cerrar el modal
    closeModalButton.addEventListener('click', () => {
        maintainerModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == maintainerModal) {
            maintainerModal.style.display = 'none';
        }
    });

    /* ====================
       Funciones para Entidades
       ==================== */
       addEntityButton.addEventListener('click', () => {
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
            <div id="specialtiesSection" class="form-row" style="display:none;">
                <label>Especialidad:</label>
                <div>
                    <label><input type="checkbox" name="specialty" value="Civil"> Civil</label>
                    <label><input type="checkbox" name="specialty" value="Penal"> Penal</label>
                    <label><input type="checkbox" name="specialty" value="Laboral"> Laboral</label>
                    <label><input type="checkbox" name="specialty" value="Tributario"> Tributario</label>
                    <label><input type="checkbox" name="specialty" value="Familia"> Familia</label>
                    <label><input type="checkbox" name="specialty" value="Comercial"> Comercial</label>
                    <label><input type="checkbox" name="specialty" value="Ambiental"> Ambiental</label>
                </div>
            </div>
            <div class="form-actions">
                <button type="submit" class="save-button">Guardar</button>              
            </div>
        `;
    
        showModal("Agregar Nueva Entidad", formContent, async function (event) {
            event.preventDefault();
            
            const specialties = [];
            document.querySelectorAll('input[name="specialty"]:checked').forEach(checkbox => {
                specialties.push(checkbox.value);
            });
    
            const nuevaEntidad = {
                Rut: document.getElementById('entityRut').value,
                Nombre: document.getElementById('entityName').value,
                Direccion: document.getElementById('entityAddress').value,
                Telefono: document.getElementById('entityPhone').value,
                Correo: document.getElementById('entityEmail').value,
                TipoEntidad: document.getElementById('entityType').value,
            };
    
            if (nuevaEntidad.TipoEntidad === "Abogado") {
                nuevaEntidad.Especialidades = specialties;
            }
    
            try {
                await addDoc(collection(db, "Entidades"), nuevaEntidad);
                console.log("Entidad agregada con éxito.");
                maintainerModal.style.display = 'none';
                maintainerForm.reset();
                loadEntities(); // Recargar la lista de entidades después de agregar una nueva
            } catch (e) {
                console.error("Error al agregar la entidad: ", e);
            }
        });
    
        // Mostrar/ocultar especialidades dependiendo del tipo de entidad seleccionado
        document.getElementById('entityType').addEventListener('change', function () {
            const specialtiesSection = document.getElementById('specialtiesSection');
            if (this.value === 'Abogado') {
                specialtiesSection.style.display = 'block';
            } else {
                specialtiesSection.style.display = 'none';
            }
        });   
        
    });

    
    // Cargar entidades desde Firestore
    async function loadEntities() {
        try {
            const querySnapshot = await getDocs(collection(db, "Entidades"));
            entityTableBody.innerHTML = ""; // Limpiar tabla
    
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${data.Rut}</td>
                    <td>${data.Nombre}</td>
                    <td>${data.Direccion}</td>
                    <td>${data.Telefono}</td>
                    <td>${data.Correo}</td>
                    <td>${data.TipoEntidad}</td>
                    <td>
                        <button class="edit-button" data-id="${doc.id}">✏️</button>
                        <button class="delete-button" data-id="${doc.id}">🗑️</button>
                    </td>
                `;
                entityTableBody.appendChild(row);
    
                // Añadir eventos a los botones de editar y eliminar
                row.querySelector('.edit-button').addEventListener('click', () => editEntity(doc.id, data));
                row.querySelector('.delete-button').addEventListener('click', () => deleteEntity(doc.id));
            });
        } catch (e) {
            console.error("Error al cargar entidades: ", e);
        }
    }
    
    // Editar entidad
    function editEntity(id, data) {
        const formContent = `
            <div class="form-row">
                <label for="entityRut">RUT:</label>
                <input type="text" id="entityRut" name="entityRut" value="${data.Rut}" required>
            </div>
            <div class="form-row">
                <label for="entityName">Nombre:</label>
                <input type="text" id="entityName" name="entityName" value="${data.Nombre}" required>
            </div>
            <div class="form-row">
                <label for="entityAddress">Dirección:</label>
                <input type="text" id="entityAddress" name="entityAddress" value="${data.Direccion}" required>
            </div>
            <div class="form-row">
                <label for="entityPhone">Teléfono:</label>
                <input type="text" id="entityPhone" name="entityPhone" value="${data.Telefono}" required>
            </div>
            <div class="form-row">
                <label for="entityEmail">Correo:</label>
                <input type="email" id="entityEmail" name="entityEmail" value="${data.Correo}" required>
            </div>
            <div class="form-row">
                <label for="entityType">Tipo de Entidad:</label>
                <select id="entityType" name="entityType" required>
                    <option value="Cliente" ${data.TipoEntidad === "Cliente" ? "selected" : ""}>Cliente</option>
                    <option value="Abogado" ${data.TipoEntidad === "Abogado" ? "selected" : ""}>Abogado</option>
                    <option value="Receptor Judicial" ${data.TipoEntidad === "Receptor Judicial" ? "selected" : ""}>Receptor Judicial</option>
                    <option value="Abogado Coordinador" ${data.TipoEntidad === "Abogado Coordinador" ? "selected" : ""}>Abogado Coordinador</option>
                </select>
            </div>
            <div id="specialtiesSection" class="form-row" style="display:${data.TipoEntidad === "Abogado" ? "block" : "none"};">
                <label>Especialidad:</label>
                <div>
                    <label><input type="checkbox" name="specialty" value="Civil" ${data.Especialidades?.includes("Civil") ? "checked" : ""}> Civil</label>
                    <label><input type="checkbox" name="specialty" value="Penal" ${data.Especialidades?.includes("Penal") ? "checked" : ""}> Penal</label>
                    <label><input type="checkbox" name="specialty" value="Laboral" ${data.Especialidades?.includes("Laboral") ? "checked" : ""}> Laboral</label>
                    <label><input type="checkbox" name="specialty" value="Tributario" ${data.Especialidades?.includes("Tributario") ? "checked" : ""}> Tributario</label>
                    <label><input type="checkbox" name="specialty" value="Familia" ${data.Especialidades?.includes("Familia") ? "checked" : ""}> Familia</label>
                    <label><input type="checkbox" name="specialty" value="Comercial" ${data.Especialidades?.includes("Comercial") ? "checked" : ""}> Comercial</label>
                    <label><input type="checkbox" name="specialty" value="Ambiental" ${data.Especialidades?.includes("Ambiental") ? "checked" : ""}> Ambiental</label>
                </div>
            </div>
            <div class="form-actions">
                <button type="submit" class="save-button">Guardar</button>
            </div>
        `;
    
        showModal("Editar Entidad", formContent, async function (event) {
            event.preventDefault();
            
            const specialties = [];
            document.querySelectorAll('input[name="specialty"]:checked').forEach(checkbox => {
                specialties.push(checkbox.value);
            });
    
            const updatedEntity = {
                Rut: document.getElementById('entityRut').value,
                Nombre: document.getElementById('entityName').value,
                Direccion: document.getElementById('entityAddress').value,
                Telefono: document.getElementById('entityPhone').value,
                Correo: document.getElementById('entityEmail').value,
                TipoEntidad: document.getElementById('entityType').value,
            };
    
            if (updatedEntity.TipoEntidad === "Abogado") {
                updatedEntity.Especialidades = specialties;
            }
    
            try {
                await updateDoc(doc(db, "Entidades", id), updatedEntity);
                console.log("Entidad actualizada con éxito.");
                maintainerModal.style.display = 'none';
                maintainerForm.reset();
                loadEntities(); // Recargar la lista de entidades después de la actualización
            } catch (e) {
                console.error("Error al actualizar la entidad: ", e);
            }
        });
    
        // Mostrar/ocultar especialidades dependiendo del tipo de entidad seleccionado
        document.getElementById('entityType').addEventListener('change', function () {
            const specialtiesSection = document.getElementById('specialtiesSection');
            if (this.value === 'Abogado') {
                specialtiesSection.style.display = 'block';
            } else {
                specialtiesSection.style.display = 'none';
            }
        });
    }
    
    // Eliminar entidad
    async function deleteEntity(id) {
        if (confirm("¿Estás seguro de que deseas eliminar esta entidad?")) {
            try {
                await deleteDoc(doc(db, "Entidades", id));
                console.log("Entidad eliminada con éxito.");
                loadEntities(); // Recargar la lista de entidades después de la eliminación
            } catch (e) {
                console.error("Error al eliminar la entidad: ", e);
            }
        }
    }
    
    // Manejar la búsqueda de entidades
    searchEntityInput?.addEventListener('input', function () {
        const searchValue = searchEntityInput.value.toLowerCase();
        const rows = entityTableBody.getElementsByTagName('tr');
        Array.from(rows).forEach(row => {
            const rut = row.cells[0].innerText.toLowerCase();
            const nombre = row.cells[1].innerText.toLowerCase();
            if (rut.includes(searchValue) || nombre.includes(searchValue)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    /* ====================
       Funciones para Tipos de Servicio
       ==================== */
       addServiceTypeButton.addEventListener('click', () => {
        const formContent = `
            <div class="form-row">
                <label for="serviceCode">Código:</label>
                <input type="text" id="serviceCode" name="serviceCode" required>
            </div>
            <div class="form-row">
                <label for="serviceDescription">Descripción:</label>
                <input type="text" id="serviceDescription" name="serviceDescription" required>
            </div>
            <div class="form-actions">
                <button type="submit" class="save-button">Guardar</button>                
            </div>
        `;

        showModal("Agregar Nuevo Tipo de Servicio", formContent, async function (event) {
            event.preventDefault();
            const nuevoServicio = {
                Codigo: document.getElementById('serviceCode').value,
                Descripcion: document.getElementById('serviceDescription').value,
            };

            try {
                await addDoc(collection(db, "TipoServicio"), nuevoServicio);
                console.log("Tipo de servicio agregado con éxito.");
                maintainerModal.style.display = 'none';
                maintainerForm.reset();
                loadServiceTypes(); // Recargar la lista de tipos de servicio después de agregar uno nuevo
            } catch (e) {
                console.error("Error al agregar el tipo de servicio: ", e);
            }
        });

        // Botón cancelar
        document.getElementById('cancelModalButton').addEventListener('click', () => {
            maintainerModal.style.display = 'none';
        });
    });

    // Cargar tipos de servicio desde Firestore
    async function loadServiceTypes() {
        try {
            const querySnapshot = await getDocs(collection(db, "TipoServicio"));
            serviceTypeTableBody.innerHTML = ""; // Limpiar tabla

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${data.Codigo}</td>
                    <td>${data.Descripcion}</td>
                    <td>
                        <button class="edit-button" data-id="${doc.id}">✏️</button>
                        <button class="delete-button" data-id="${doc.id}">🗑️</button>
                    </td>
                `;
                serviceTypeTableBody.appendChild(row);

                // Añadir eventos a los botones de editar y eliminar
                row.querySelector('.edit-button').addEventListener('click', () => editServiceType(doc.id, data));
                row.querySelector('.delete-button').addEventListener('click', () => deleteServiceType(doc.id));
            });
        } catch (e) {
            console.error("Error al cargar tipos de servicio: ", e);
        }
    }

    // Editar tipo de servicio
    function editServiceType(id, data) {
        const formContent = `
            <div class="form-row">
                <label for="serviceCode">Código:</label>
                <input type="text" id="serviceCode" name="serviceCode" value="${data.Codigo}" required>
            </div>
            <div class="form-row">
                <label for="serviceDescription">Descripción:</label>
                <input type="text" id="serviceDescription" name="serviceDescription" value="${data.Descripcion}" required>
            </div>
            <div class="form-actions">
                <button type="submit" class="save-button">Guardar</button>                
            </div>
        `;

        showModal("Editar Tipo de Servicio", formContent, async function (event) {
            event.preventDefault();
            const updatedService = {
                Codigo: document.getElementById('serviceCode').value,
                Descripcion: document.getElementById('serviceDescription').value,
            };

            try {
                await updateDoc(doc(db, "TipoServicio", id), updatedService);
                console.log("Tipo de servicio actualizado con éxito.");
                maintainerModal.style.display = 'none';
                maintainerForm.reset();
                loadServiceTypes(); // Recargar la lista de tipos de servicio después de la actualización
            } catch (e) {
                console.error("Error al actualizar el tipo de servicio: ", e);
            }
        });        
    }

    // Eliminar tipo de servicio
    async function deleteServiceType(id) {
        if (confirm("¿Estás seguro de que deseas eliminar este tipo de servicio?")) {
            try {
                await deleteDoc(doc(db, "TipoServicio", id));
                console.log("Tipo de servicio eliminado con éxito.");
                loadServiceTypes(); // Recargar la lista de tipos de servicio después de la eliminación
            } catch (e) {
                console.error("Error al eliminar el tipo de servicio: ", e);
            }
        }
    }

    // Manejar la búsqueda de tipos de servicio
    searchServiceInput?.addEventListener('input', function () {
        const searchValue = searchServiceInput.value.toLowerCase();
        const rows = serviceTypeTableBody.getElementsByTagName('tr');
        Array.from(rows).forEach(row => {
            const codigo = row.cells[0].innerText.toLowerCase();
            const descripcion = row.cells[1].innerText.toLowerCase();
            if (codigo.includes(searchValue) || descripcion.includes(searchValue)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    /* ====================
       Funciones para Tribunales
       ==================== */
       addCourtButton.addEventListener('click', () => {
        const formContent = `
            <div class="form-row">
                <label for="courtCode">Código:</label>
                <input type="text" id="courtCode" name="courtCode" required>
            </div>
            <div class="form-row">
                <label for="courtName">Nombre del Tribunal:</label>
                <input type="text" id="courtName" name="courtName" required>
            </div>
            <div class="form-actions">
                <button type="submit" class="save-button">Guardar</button>    
                
            </div>
        `;

        showModal("Agregar Nuevo Tribunal", formContent, async function (event) {
            event.preventDefault();
            const nuevoTribunal = {
                Codigo: document.getElementById('courtCode').value,
                Descripcion: document.getElementById('courtName').value,
            };

            try {
                await addDoc(collection(db, "Tribunales"), nuevoTribunal);
                console.log("Tribunal agregado con éxito.");
                maintainerModal.style.display = 'none';
                maintainerForm.reset();
                loadCourts(); // Recargar la lista de tribunales después de agregar uno nuevo
            } catch (e) {
                console.error("Error al agregar el tribunal: ", e);
            }
        });         
    });

    // Cargar tribunales desde Firestore
    async function loadCourts() {
        try {
            const querySnapshot = await getDocs(collection(db, "Tribunales"));
            courtTableBody.innerHTML = ""; // Limpiar tabla

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${data.Codigo}</td>
                    <td>${data.Descripcion}</td>
                    <td>
                        <button class="edit-button" data-id="${doc.id}">✏️</button>
                        <button class="delete-button" data-id="${doc.id}">🗑️</button>                        
                    </td>
                `;
                courtTableBody.appendChild(row);

                // Añadir eventos a los botones de editar y eliminar
                row.querySelector('.edit-button').addEventListener('click', () => editCourt(doc.id, data));
                row.querySelector('.delete-button').addEventListener('click', () => deleteCourt(doc.id));
            });
        } catch (e) {
            console.error("Error al cargar los tribunales: ", e);
        }
    }

    // Editar tribunal
    function editCourt(id, data) {
        const formContent = `
            <div class="form-row">
                <label for="courtCode">Código:</label>
                <input type="text" id="courtCode" name="courtCode" value="${data.Codigo}" required>
            </div>
            <div class="form-row">
                <label for="courtName">Nombre del Tribunal:</label>
                <input type="text" id="courtName" name="courtName" value="${data.Descripcion}" required>
            </div>
            <div class="form-actions">
                <button type="submit" class="save-button">Guardar</button>                
            </div>
        `;

        showModal("Editar Tribunal", formContent, async function (event) {
            event.preventDefault();
            const updatedCourt = {
                Codigo: document.getElementById('courtCode').value,
                Descripcion: document.getElementById('courtName').value,
            };

            try {
                await updateDoc(doc(db, "Tribunales", id), updatedCourt);
                console.log("Tribunal actualizado con éxito.");
                maintainerModal.style.display = 'none';
                maintainerForm.reset();
                loadCourts(); // Recargar la lista de tribunales después de la actualización
            } catch (e) {
                console.error("Error al actualizar el tribunal: ", e);
            }
        });
    
    }

    // Eliminar tribunal
    async function deleteCourt(id) {
        if (confirm("¿Estás seguro de que deseas eliminar este tribunal?")) {
            try {
                await deleteDoc(doc(db, "Tribunales", id));
                console.log("Tribunal eliminado con éxito.");
                loadCourts(); // Recargar la lista de tribunales después de la eliminación
            } catch (e) {
                console.error("Error al eliminar el tribunal: ", e);
            }
        }
    }

    // Manejar la búsqueda de tribunales
    searchStateInput?.addEventListener('input', function () {
        const searchValue = searchStateInput.value.toLowerCase();
        const rows = stateTableBody.getElementsByTagName('tr');
        Array.from(rows).forEach(row => {
            const codigo = row.cells[0].innerText.toLowerCase();
            const descripcion = row.cells[1].innerText.toLowerCase();
            if (codigo.includes(searchValue) || descripcion.includes(searchValue)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

     /* ====================
       Funciones para Estados
       ==================== */
       addStateButton.addEventListener('click', () => {
        const formContent = `
            <div class="form-row">
                <label for="stateCode">Código:</label>
                <input type="text" id="stateCode" name="stateCode" required>
            </div>
            <div class="form-row">
                <label for="stateName">Descripción del Estado:</label>
                <input type="text" id="stateName" name="stateName" required>
            </div>
            <div class="form-actions">
                <button type="submit" class="save-button">Guardar</button>            
            </div>        
        `;

        // Agregar estado
        showModal("Agregar Nuevo Estado", formContent, async function (event) {
            event.preventDefault();
            const nuevoEstado = {
                codigo: document.getElementById('stateCode').value,
                descripcion: document.getElementById('stateName').value,
            };

            try {
                await addDoc(collection(db, "estados"), nuevoEstado);
                console.log("Estado agregado con éxito.");
                maintainerModal.style.display = 'none';
                maintainerForm.reset();
                loadStates(); // Recargar la lista de estados después de agregar uno nuevo
            } catch (e) {
                console.error("Error al agregar el estado: ", e);
            }
        });
    });

    // Cargar estados desde Firestore
    async function loadStates() {
        try {
            const querySnapshot = await getDocs(collection(db, "EstadoJudicial"));
            stateTableBody.innerHTML = ""; // Limpiar tabla
    
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${data.Codigo}</td>
                    <td>${data.Descripcion}</td>
                    <td>
                        <button class="edit-button" data-id="${doc.id}">✏️</button>
                        <button class="delete-button" data-id="${doc.id}">🗑️</button>
                    </td>
                `;
                stateTableBody.appendChild(row);
    
                // Añadir eventos a los botones de editar y eliminar
                row.querySelector('.edit-button').addEventListener('click', () => editState(doc.id, data));
                row.querySelector('.delete-button').addEventListener('click', () => deleteState(doc.id));
            });
        } catch (e) {
            console.error("Error al cargar los estados: ", e);
        }
    }
    //Editar estado
    function editState(id, data) {
        const formContent = `
            <div class="form-row">
                <label for="stateCode">Código:</label>
                <input type="text" id="stateCode" name="stateCode" value="${data.Codigo}" required>
            </div>
            <div class="form-row">
                <label for="stateName">Descripción del Estado:</label>
                <input type="text" id="stateName" name="stateName" value="${data.Descripcion}" required>
            </div>
            <div class="form-actions">
                <button type="submit" class="save-button">Guardar</button>
                           </div>
        `;

        showModal("Editar Estado", formContent, async function (event) {
            event.preventDefault();
            const updatedState = {
                Codigo: document.getElementById('stateCode').value,
                Descripcion: document.getElementById('stateName').value,
            };

            try {
                await updateDoc(doc(db, "EstadoJudicial", id), updatedState);
                console.log("Estado actualizado con éxito.");
                maintainerModal.style.display = 'none';
                maintainerForm.reset();
                loadStates(); // Recargar la lista de estados después de la actualización
            } catch (e) {
                console.error("Error al actualizar el estado: ", e);
            }
        });
    }
    

    // Eliminar estado
    async function deleteState(id) {
        if (confirm("¿Estás seguro de que deseas eliminar este estado?")) {
            try {
                await deleteDoc(doc(db, "EstadoJudicial", id));
                console.log("Estado eliminado con éxito.");
                loadStates(); // Recargar la lista de estados después de la eliminación
            } catch (e) {
                console.error("Error al eliminar el estado: ", e);
            }
        }
    }

    // Manejar la búsqueda de estados
    searchStateInput?.addEventListener('input', function () {
        const searchValue = searchStateInput.value.toLowerCase();
        const rows = stateTableBody.getElementsByTagName('tr');
        Array.from(rows).forEach(row => {
            const codigo = row.cells[0].innerText.toLowerCase();
            const descripcion = row.cells[1].innerText.toLowerCase();
            if (codigo.includes(searchValue) || descripcion.includes(searchValue)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
});
