import { db } from "../firebaseConfig.js";
import { collection, getDocs, getDoc, doc, updateDoc, arrayUnion, increment, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", function () {
    const resultsTableBody = document.getElementById("resultsTableBody");
    const searchForm = document.getElementById("searchForm");


    let filters = {}; // Almacena los filtros activos
    let honorarioGroups = [];
    let currentGroupIndex = null; // Variable global para el índice del grupo
    let currentPaymentId = null; // Almacena el ID del pago a editar
    let currentNumDocumentoPago = null; // Almacena el número de documento del pago a editar

    // Función principal para cargar y renderizar honorarios
    async function loadHonorarios(updatedFilters = {}) {
        try {
            // Actualizar filtros globales
            filters = { ...filters, ...updatedFilters };

            const honorarios = await fetchHonorarios();
            const filteredHonorarios = applyFilters(honorarios, filters);
            const groupedHonorarios = groupHonorariosByClient(filteredHonorarios);
            renderHonorariosTable(groupedHonorarios, "#honorariosTable");
        } catch (error) {
            console.error("Error al cargar honorarios:", error);
        }
    }

    // Fetch de datos de honorarios desde Firebase
    async function fetchHonorarios() {
        const snapshot = await getDocs(collection(db, "honorarios"));
    const honorarios = snapshot.docs.map(doc => ({
        id: doc.id, // Incluye el ID del documento
        ...doc.data(),
    }));

     // Agrega este log para verificar las fechas recuperadas
     honorarios.forEach(honorario => {
        console.log("Fecha recuperada:", honorario.fechaDocumento);
    });

    
    // Eliminar duplicados basados en el rol
    const uniqueHonorarios = [];
    const seenRoles = new Set();
    let duplicatesCount = 0;

    for (const honorario of honorarios) {
        if (!seenRoles.has(honorario.rol)) {
            seenRoles.add(honorario.rol);
            uniqueHonorarios.push(honorario);
        } else {
            duplicatesCount++;
            console.warn(`Honorario duplicado encontrado y excluido: Rol ${honorario.rol}`);
        }
    }

    console.log(`Datos obtenidos de Firebase: ${honorarios.length} honorarios.`);
    console.log(`Duplicados eliminados: ${duplicatesCount}`);
    console.log("Datos únicos procesados:", uniqueHonorarios);

    return uniqueHonorarios;
}

    // Filtrar los honorarios según los filtros aplicados
    function applyFilters(honorarios, filters) {
        return honorarios.filter(honorario => {
            const { periodoDesde, periodoHasta, tipo, cliente } = filters;

            // Filtro por periodo
            if (periodoDesde && new Date(honorario.fechaDocumento) < new Date(periodoDesde)) {
                return false;
            }
            if (periodoHasta && new Date(honorario.fechaDocumento) > new Date(periodoHasta)) {
                return false;
            }

            // Cálculo del saldo
            const totalPagos = (honorario.pagos || []).reduce((sum, pago) => sum + parseFloat(pago.monto || 0), 0);
            const saldo = parseFloat(honorario.monto || 0) - totalPagos;

            // Filtro por tipo
            if (tipo === "pendientes" && saldo <= 0) {
                return false;
            }
            if (tipo === "pagadas" && saldo !== 0) {
                return false;
            }

            // Filtro por cliente
            if (cliente && !(
                (honorario.rutCliente && honorario.rutCliente.toLowerCase().includes(cliente.toLowerCase())) ||
                (honorario.nombreCliente && honorario.nombreCliente.toLowerCase().includes(cliente.toLowerCase()))
            )) {
                return false;
            }

            return true;
        });
    }

    // Agrupar honorarios por rutCliente
    function groupHonorariosByClient(honorarios) {
        return honorarios.reduce((groups, item) => {
            const { rutCliente, rol } = item;
    
            // Manejar honorarios sin un rutCliente válido
            const clienteKey = rutCliente || "Sin RUT";
    
            if (!groups[clienteKey]) {
                groups[clienteKey] = [];
            }
    
            // Evitar duplicados dentro del mismo grupo
            if (!groups[clienteKey].some(h => h.rol === rol)) {
                groups[clienteKey].push(item);
            }
    
            return groups;
        }, {});
    }
    
    // Renderizar la tabla con los honorarios
    function renderHonorariosTable(groupedHonorarios, tableId) {
        let rows = "";
        let groupIndex = 0; // Contador explícito para los índices

        // Limpiar el array global antes de rellenarlo nuevamente
        honorarioGroups = [];

        for (const rutCliente in groupedHonorarios) {
            const group = groupedHonorarios[rutCliente];
            const nombreCliente = group[0]?.nombreCliente || "Cliente Desconocido";

            const { subtotalMonto, subtotalAbono, subtotalSaldo, groupRows } = calculateGroupSubtotals(group);

            rows += groupRows;

            // Agregar el grupo actual al array global
            honorarioGroups.push(group)

            // Agregar subtotales del grupo
            rows += `
            <tr class="table-secondary font-weight-bold">
            <td colspan="6" class="text-right">Subtotal para ${nombreCliente}:</td>
            <td>${formatCurrency(subtotalMonto)}</td>
            <td>${formatCurrency(subtotalAbono)}</td>
            <td>${formatCurrency(subtotalSaldo)}</td>
            <td>            
            <button class="btn btn-success" onclick="openPaymentModal('${rutCliente}', '${nombreCliente}', ${groupIndex})">💲Pagar </button>
            </td>
        </tr>
        `;

            groupIndex++; // Incrementa el contador después de procesar cada grupo
        }

        // Mostrar mensaje si no hay datos
        if (rows.trim() === "") {
            rows = `<tr><td colspan="10" class="text-center">No hay datos disponibles</td></tr>`;
        }

        const tableBody = document.querySelector(`${tableId} tbody`);
        if (tableBody) {
            tableBody.innerHTML = rows;
        } else {
            console.error(`El tbody de la tabla con ID ${tableId} no fue encontrado.`);
        }
    }

    
    // Calcular subtotales de un grupo de honorarios
    function calculateGroupSubtotals(group) {
        let subtotalMonto = 0;
        let subtotalAbono = 0;
        let subtotalSaldo = 0;
        let groupRows = "";

        group.forEach(data => {
            const monto = parseFloat(data.monto) || 0;
            const pagos = data.pagos || [];
            const totalAbonos = pagos.reduce((sum, pago) => sum + (pago.monto || 0), 0); // Sumar todos los montos del array `pagos`
            const saldo = monto - totalAbonos;

            subtotalMonto += monto;
            subtotalAbono += totalAbonos;
            subtotalSaldo += saldo;

           // Aquí aplicamos la modificación para procesar correctamente la fecha
        const fecha = data.fechaDocumento
        ? data.fechaDocumento.split("-").reverse().join("-") // Convierte 'YYYY-MM-DD' a 'DD-MM-YYYY'
        : "N/A";
        
            groupRows += `
                <tr>
                <td>${data.rutCliente || "N/A"}</td>
                <td>${data.nombreCliente || "N/A"}</td>
                <td>${data.rol || "N/A"}</td>
                <td>${data.tipoDocumento || "N/A"}</td>
                <td>${data.numeroDocumento || "N/A"}</td>
                <td>${fecha}</td>
                <td>${formatCurrency(monto)}</td>
                <td>${formatCurrency(totalAbonos)}</td>
                <td>${formatCurrency(saldo)}</td>
                <td>    
        <button class="btn btn-primary btn-sm" onclick="editPayment('${data.id}')">✏️</button>        
    </td>
                </tr>
            `;
        });

        return { subtotalMonto, subtotalAbono, subtotalSaldo, groupRows };
    }

    // Formatear valores como moneda
    function formatCurrency(value) {
        return new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            minimumFractionDigits: 0,
        }).format(value);
    }

    // Mostrar el modal con datos dinámicos
    window.openPaymentModal = function (rutCliente, nombreCliente, groupIndex) {
        currentGroupIndex = groupIndex; // Actualiza el índice actual del grupo

        const documentos = honorarioGroups[groupIndex];

        if (!documentos) {
            console.error("No se encontraron documentos para el grupo:", groupIndex);
            return;
        }

        // Reiniciar los campos del modal
        document.getElementById("fechaPago").value = "";
        document.getElementById("tipoPago").value = "";
        document.getElementById("numDocumentoPago").value = "";

        // Mostrar RUT y Nombre del Cliente en el encabezado del modal
        document.getElementById("modalClienteRUT").textContent = rutCliente;
        document.getElementById("modalClienteNombre").textContent = nombreCliente;

        const paymentTableBody = document.getElementById("paymentTableBody");
        paymentTableBody.innerHTML = ""; // Limpia las filas previas

        documentos.forEach((doc) => {
            const monto = parseFloat(doc.monto || 0);
            const pagos = doc.pagos || []; // Asegúrate de cargar los pagos existentes
            const totalPagos = pagos.reduce((sum, pago) => sum + (parseFloat(pago.monto) || 0), 0); // Suma de abonos
            const saldo = monto - totalPagos;

            const fecha = doc.fechaDocumento
                ? new Date(doc.fechaDocumento).toLocaleDateString("es-CL", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                })
                : "N/A";

            paymentTableBody.innerHTML += `
                <tr>
                    <td>${fecha}</td>
                    <td>${doc.numeroDocumento || "N/A"}</td>
                    <td>${formatCurrency(saldo)}</td>
                    <td>
                        <input type="text" class="form-control montoPagar" 
                               data-saldo="${saldo}" placeholder="0">
                    </td>
                    <td>
                        <input type="checkbox" class="pagarCheckbox">
                    </td>
                </tr>
            `;
        });

        // Reasigna los eventos dinámicamente a los inputs
        document.querySelectorAll(".montoPagar").forEach((input) => {
            input.addEventListener("input", function () {
                // Elimina caracteres no numéricos
                let rawValue = input.value.replace(/\D/g, "");
                if (rawValue === "") rawValue = "0";

                const saldo = parseFloat(input.dataset.saldo);
                const monto = parseFloat(rawValue);

                if (monto > saldo) {
                    alert("El monto a pagar no puede ser mayor al saldo.");
                    rawValue = saldo.toString();
                }

                // Formatear para visualización
                input.value = new Intl.NumberFormat("es-CL").format(rawValue);

                // Marca automáticamente el checkbox si el monto es mayor a 0
                const checkbox = input.closest("tr").querySelector(".pagarCheckbox");
                if (checkbox) {
                    checkbox.checked = monto > 0; // Marca el checkbox si el monto es válido
                }

                // Actualiza el total al cambiar el monto
                updateTotalPago();
            });
        });

        // Reasigna los eventos dinámicamente a los checkboxes
        document.querySelectorAll(".pagarCheckbox").forEach((checkbox) => {
            checkbox.addEventListener("change", function () {
                const row = checkbox.closest("tr");
                const montoInput = row.querySelector(".montoPagar");

                // Si el checkbox se marca, asegura que el monto sea considerado
                if (checkbox.checked && montoInput) {
                    if (montoInput.value === "" || parseFloat(montoInput.value.replace(/\D/g, "")) === 0) {
                        montoInput.value = "0"; // Asegura que haya un valor válido
                    }
                }

                // Actualiza el total al cambiar el estado del checkbox
                updateTotalPago();
            });
        });

        // Muestra el modal
        $("#paymentModal").modal("show");
    };

    
    // Actualizar el total a pagar
    function updateTotalPago() {
        const rows = document.querySelectorAll("#paymentTableBody tr");
        let total = 0;

        rows.forEach((row) => {
            const montoInput = row.querySelector(".montoPagar");
            const checkbox = row.querySelector(".pagarCheckbox");

            if (checkbox && checkbox.checked) {
                // Limpia el valor formateado antes de usarlo en los cálculos
                const rawValue = montoInput.value.replace(/\D/g, ""); // Elimina puntos, comas y símbolos
                const monto = parseFloat(rawValue) || 0; // Convierte a número
                total += monto; // Suma el monto
            }
        });

        // Actualiza el total en el elemento #totalPago (formateado)
        document.getElementById("totalPago").textContent = new Intl.NumberFormat("es-CL", {
            style: "decimal",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(total);
    }

    // Enviar el pago
    document.getElementById("paymentForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const fechaPago = document.getElementById("fechaPago").value;
        const tipoPago = document.getElementById("tipoPago").value;
        const numDocumentoPago = document.getElementById("numDocumentoPago").value;

        if (!fechaPago || !tipoPago) {
            alert("Debe ingresar la Fecha de Pago y el Tipo de Pago.");
            return;
        }

        const rows = document.querySelectorAll("#paymentTableBody tr");
        let abonos = [];
        const documentos = honorarioGroups[currentGroupIndex]; // Usa `currentGroupIndex` global o pasada al modal

        rows.forEach((row, index) => {
            const checkbox = row.querySelector(".pagarCheckbox");
            const montoInput = row.querySelector(".montoPagar");

            if (checkbox.checked) {
                // Limpia el monto procesado
                const montoLimpio = parseFloat(montoInput.value.replace(/\D/g, "")) || 0;
                const saldo = parseFloat(montoInput.dataset.saldo) || 0;

                if (montoLimpio > saldo) {
                    alert(`El monto a pagar no puede ser mayor al saldo (${formatCurrency(saldo)}).`);
                    return;
                }

                const numeroDocumento = row.children[1].textContent;

                abonos.push({
                    id: documentos[index]?.id || null, // Asegúrate de obtener el ID correcto
                    numeroDocumento,
                    monto: montoLimpio, // Procesa correctamente el monto
                    fechaPago,
                    tipoPago,
                    numDocumentoPago,
                });
            }
        });


        if (abonos.length > 0) {
            try {
                // Guarda los abonos en la base de datos
                await saveAbonosToFirebase(abonos);

                // Actualiza la tabla principal
                abonos.forEach((abono) => {
                    updateMainTable(abono);
                });

                // Cierra el modal
                $("#paymentModal").modal("hide");
            } catch (error) {
                console.error("Error al procesar el pago:", error);
            }
        } else {
            alert("Debe seleccionar al menos un documento para pagar.");
        }
    });

    async function saveAbonosToFirebase(abonos) {
        try {
            for (const abono of abonos) {
                // Verifica que el monto esté limpio y procesado correctamente
                const montoLimpio = parseFloat(abono.monto.toString().replace(/\D/g, "")) || 0;

                console.log("Monto limpio antes de guardar en Firebase:", montoLimpio);

                const docRef = doc(db, "honorarios", abono.id);

                // Actualiza el array `pagos` en Firestore
                await updateDoc(docRef, {
                    pagos: arrayUnion({
                        fechaPago: abono.fechaPago,
                        tipoPago: abono.tipoPago,
                        numDocumentoPago: abono.numDocumentoPago,
                        monto: montoLimpio, // Asegúrate de que es un número válido
                    }),
                });
            }

            alert("Pago guardado correctamente.");
            loadHonorarios();
        } catch (error) {
            console.error("Error al guardar los pagos en Firebase:", error);
        }
    }


    // Actualizar la tabla principal con los datos de abono
    function updateMainTable(abono) {
        const rows = document.querySelectorAll("#honorariosTable tbody tr");

        rows.forEach((row) => {
            const numeroDocumento = row.children[4]?.textContent || "";

            if (numeroDocumento === abono.numeroDocumento) {
                const abonoCell = row.children[7]; // Columna Abono
                const saldoCell = row.children[8]; // Columna Saldo

                if (abonoCell && saldoCell) {
                    const pagos = row.dataset.pagos || []; // Carga el array `pagos` del dataset
                    const totalAbonos = pagos.reduce((sum, pago) => sum + parseFloat(pago.monto || 0), 0); // Suma correctamente

                    abonoCell.textContent = formatCurrency(totalAbonos);
                    saldoCell.textContent = formatCurrency(parseFloat(row.children[6].textContent.replace(/\$|,/g, "")) - totalAbonos);
                }
            }
        });
    }

    function formatDateToInput(date) {
        if (!date) return ""; // Devuelve una cadena vacía si la fecha no está definida
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            console.error("Fecha inválida:", date);
            return ""; // Manejar fechas inválidas
        }
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0"); // Mes en formato 2 dígitos
        const day = String(d.getDate()).padStart(2, "0"); // Día en formato 2 dígitos
        return `${year}-${month}-${day}`;
    }


    window.editPayment = async function (paymentId) {
        try {
            const docRef = doc(db, "honorarios", paymentId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                alert("El documento no existe.");
                return;
            }

            const pagos = docSnap.data().pagos || [];
            const tableBody = document.getElementById("editPaymentTableBody");
            tableBody.innerHTML = ""; // Limpiar la tabla

            pagos.forEach((pago, index) => {
                const row = `
              <tr>
                <td>
                  <input type="date" class="form-control editFechaPago" value="${formatDateToInput(pago.fechaPago)}" data-index="${index}">
                </td>
                <td>
                  <select class="form-control editTipoPago" data-index="${index}">
                    <option value="transferencia" ${pago.tipoPago === "transferencia" ? "selected" : ""}>Transferencia</option>
                    <option value="efectivo" ${pago.tipoPago === "efectivo" ? "selected" : ""}>Efectivo</option>
                    <option value="cheque" ${pago.tipoPago === "cheque" ? "selected" : ""}>Cheque</option>
                  </select>
                </td>
                <td>
                  <input type="text" class="form-control editMontoPago" value="${pago.monto.toLocaleString("es-CL")}" data-index="${index}">
                </td>
                <td>
                  <input type="text" class="form-control editNumDocumentoPago" value="${pago.numDocumentoPago || ""}" data-index="${index}">
                </td>
                <td>
                  <button class="btn btn-danger btn-sm deletePaymentRow" data-index="${index}">Eliminar</button>
                </td>
              </tr>
            `;
                tableBody.innerHTML += row;
            });

            // Almacena el ID actual para guardar cambios
            currentPaymentId = paymentId;

            // Mostrar el modal
            $("#editPaymentModal").modal("show");
        } catch (error) {
            console.error("Error al cargar los pagos:", error);
            alert("No se pudo cargar los pagos para editar.");
        }
    };

    // Guardar los cambios en los pagos
    document.getElementById("saveEditedPayments").addEventListener("click", async function () {
        try {
            const docRef = doc(db, "honorarios", currentPaymentId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                alert("El documento no existe.");
                return;
            }

            const pagos = docSnap.data().pagos || [];
            const updatedPagos = [];

            // Recopila los datos de la tabla
            document.querySelectorAll("#editPaymentTableBody tr").forEach((row, index) => {
                const fechaPago = row.querySelector(".editFechaPago").value;
                const tipoPago = row.querySelector(".editTipoPago").value;
                const monto = parseFloat(row.querySelector(".editMontoPago").value.replace(/\./g, "")) || 0;
                const numDocumentoPago = row.querySelector(".editNumDocumentoPago").value;

                updatedPagos.push({ fechaPago, tipoPago, monto, numDocumentoPago });
            });

            // Guardar en Firestore
            await updateDoc(docRef, {
                pagos: updatedPagos,
            });

            alert("Pagos actualizados correctamente.");
            $("#editPaymentModal").modal("hide");
            loadHonorarios(); // Recargar tabla principal
        } catch (error) {
            console.error("Error al guardar los pagos editados:", error);
            alert("No se pudieron guardar los cambios.");
        }
    });

    // Eliminar un pago desde la tabla
    document.getElementById("editPaymentTableBody").addEventListener("click", function (e) {
        if (e.target.classList.contains("deletePaymentRow")) {
            const index = parseInt(e.target.dataset.index, 10);
            e.target.closest("tr").remove(); // Eliminar la fila de la tabla
        }
    });




    // Manejar eventos en filtros para actualizar automáticamente
    document.getElementById("periodoDesde").addEventListener("change", (e) => {
        loadHonorarios({ periodoDesde: e.target.value });
    });

    document.getElementById("periodoHasta").addEventListener("change", (e) => {
        loadHonorarios({ periodoHasta: e.target.value });
    });

    document.getElementById("tipo").addEventListener("change", (e) => {
        loadHonorarios({ tipo: e.target.value });
    });

    document.getElementById("cliente").addEventListener("input", (e) => {
        loadHonorarios({ cliente: e.target.value });
    });

    // Manejar el envío del formulario (opcional con el botón "Buscar")
    searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const periodoDesde = document.getElementById("periodoDesde").value;
        const periodoHasta = document.getElementById("periodoHasta").value;
        const tipo = document.getElementById("tipo").value;
        const cliente = document.getElementById("cliente").value;

        loadHonorarios({ periodoDesde, periodoHasta, tipo, cliente });
    });

    // Cargar honorarios al cargar la página
    loadHonorarios();
});
