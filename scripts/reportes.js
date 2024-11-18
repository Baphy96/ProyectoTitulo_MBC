import { db } from "../firebaseConfig.js"; // Importar Firestore configurado
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js"; // Importar funciones necesarias

// Referencias al DOM
const selectCampos = document.getElementById("campos-tabla");
const tableBody = document.getElementById("resultsTableBody");
const buscarBtn = document.getElementById("buscar");
const exportarBtn = document.getElementById("exportar-btn");
const filtrarBtn = document.getElementById("filtrar-btn");

// Obtener datos desde Firestore
async function obtenerDatos() {
    try {
        // Referencias a las colecciones en Firestore
        const gestionCausasRef = collection(db, "causas");
        const honorariosRef = collection(db, "honorarios");

        // Obtener los datos de las colecciones
        const gestionCausasSnap = await getDocs(gestionCausasRef);
        const honorariosSnap = await getDocs(honorariosRef);

        // Convertir los datos a un formato procesable
        const gestionCausas = gestionCausasSnap.docs.map(doc => doc.data());
        const honorarios = honorariosSnap.docs.map(doc => doc.data());

        // Consolidar datos por ROL
        const datosConsolidados = {};

        // Agregar datos de causas
        gestionCausas.forEach(causa => {
            const rol = causa.rol;
            if (!datosConsolidados[rol]) {
                datosConsolidados[rol] = { ...causa, pagos: [] }; // Inicializar
            }
        });

        // Agregar datos de honorarios
        honorarios.forEach(honorario => {
            const rol = honorario.rol;
            if (!datosConsolidados[rol]) {
                datosConsolidados[rol] = { pagos: [] }; // Inicializar si no existe
            }
            datosConsolidados[rol].pagos.push({
                monto: honorario.monto,
                fechaPago: honorario.fechaDocumento,
                tipoDocumento: honorario.tipoDocumento,
                numeroDocumento: honorario.numeroDocumento
            });
        });

        // Convertir a un array para procesarlo
        return Object.values(datosConsolidados);
    } catch (error) {
        console.error("Error al obtener datos de Firestore:", error);
        return [];
    }
}

// Generar dinámicamente las opciones del cuadro desplegable
function generarOpciones() {
    const headers = document.querySelectorAll("#reportesTable thead th");
    headers.forEach(header => {
        const option = document.createElement("option");
        option.value = header.textContent.trim();
        option.textContent = header.textContent.trim();
        selectCampos.appendChild(option);
    });

    // Inicializar el plugin Bootstrap Multiselect
    $('#campos-tabla').multiselect({
        includeSelectAllOption: true,
        nonSelectedText: 'Seleccionar campos',
        selectAllText: 'Seleccionar todo',
        allSelectedText: 'Todos seleccionados',
        nSelectedText: 'seleccionados',
        buttonWidth: '250px',
        enableFiltering: true,
        filterPlaceholder: 'Buscar',
    });
}

// Renderizar datos en la tabla
function renderizarTabla(datos) {
    tableBody.innerHTML = ""; // Limpiar tabla

    datos.forEach(dato => {
        const row = document.createElement("tr");

        const totalAbono = Array.isArray(dato.pagos)
        ? dato.pagos.reduce((sum, pago, index) => {
            console.log(`Pago #${index + 1}:`, pago); // Mostrar todos los campos del objeto 'pago'
            const montoPago = parseFloat(pago.monto) || 0; // Convertir el monto a número
            return sum + montoPago; // Sumar el monto al acumulador
        }, 0)
        : 0; // Si 'pagos' no es un arreglo, el abono es 0

        // Calcular saldo (monto - abono)
const saldo = (dato.monto || 0) - (totalAbono || 0);


        // Obtener tipo de documento, número de documento, fecha, y monto
        const tipoDocumento = dato.pagos.map(p => p.tipoDocumento).join(", ") || "-";
        const numeroDocumento = dato.pagos.map(p => p.numeroDocumento).join(", ") || "-";
        const fechasDocumento = dato.pagos.map(p => p.fechaPago || p.fechaDocumento).join(", ") || "-";
        const montosDocumento = dato.pagos.map(p => p.monto || "-").join(", ");

        // Agregar celdas a la fila según los encabezados de la tabla
        row.innerHTML = `
            <td>${dato.rut || "-"}</td>
            <td>${dato.nombre || dato.nombreCliente || "-"}</td>
            <td>${dato.rol || "-"}</td>
            <td>${dato.tipoServicio || "-"}</td>
            <td>${dato.fechaIngreso || "-"}</td>
            <td>${dato.abogadoResponsable || "-"}</td>
            <td>${dato.asistentesLegales?.join(", ") || "-"}</td>
            <td>${dato.tribunal || "-"}</td>
            <td>${dato.demandado || "-"}</td>
            <td>${dato.receptorJudicial || "-"}</td>
            <td>${dato.abogadoCoordinador || "-"}</td>
            <td>${dato.estado || "-"}</td>
            <td>${tipoDocumento}</td>
            <td>${numeroDocumento}</td>
            <td>${fechasDocumento}</td>
            <td>${montosDocumento}</td>
            <td>${totalAbono}</td>
            <td>${saldo}</td>
        `;

        tableBody.appendChild(row);
    });

    // Si no hay datos, agregar una fila vacía
    if (datos.length === 0) {
        const emptyRow = document.createElement("tr");
        emptyRow.innerHTML = `<td colspan="18">No se encontraron datos</td>`;
        tableBody.appendChild(emptyRow);
    }

    // Inicializar o refrescar DataTables
    if (!$.fn.DataTable.isDataTable("#reportesTable")) {
        $('#reportesTable').DataTable({
            scrollX: true,
            responsive: true,
            language: {
                decimal: ",",
                thousands: ".",
                lengthMenu: "Mostrar _MENU_ registros por página",
                zeroRecords: "No se encontraron resultados",
                info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
                infoEmpty: "No hay registros disponibles",
                infoFiltered: "(filtrado de _MAX_ registros totales)",
                search: "Buscar:",
                paginate: {
                    first: "Primero",
                    last: "Último",
                    next: "Siguiente",
                    previous: "Anterior"
                },
                loadingRecords: "Cargando...",
                processing: "Procesando...",
                emptyTable: "No hay datos disponibles en la tabla",
                aria: {
                    sortAscending: ": activar para ordenar de forma ascendente",
                    sortDescending: ": activar para ordenar de forma descendente"
                }
            }
        });
    } else {
        $('#reportesTable').DataTable().draw(); // Refrescar DataTables
    }
}


// Filtrar columnas según opciones seleccionadas
function filtrarColumnas(camposSeleccionados) {
    const headers = document.querySelectorAll("#reportesTable thead th");
    const allCells = document.querySelectorAll("#reportesTable tbody tr td");

    headers.forEach((header, index) => {
        const isVisible = camposSeleccionados.includes(header.textContent.trim());
        header.style.display = isVisible ? "" : "none"; // Mostrar/ocultar encabezado

        // Mostrar/ocultar celdas de cada columna
        allCells.forEach((cell, cellIndex) => {
            if (cellIndex % headers.length === index) {
                cell.style.display = isVisible ? "" : "none";
            }
        });
    });
}

// Exportar datos a CSV
function exportarCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    const headers = Array.from(document.querySelectorAll("#reportesTable thead th"))
        .filter(th => th.style.display !== "none")
        .map(th => th.textContent.trim());

    csvContent += headers.join(",") + "\n";

    const rows = Array.from(document.querySelectorAll("#reportesTable tbody tr"));
    rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll("td"))
            .filter(td => td.style.display !== "none")
            .map(td => td.textContent.trim());
        csvContent += cells.join(",") + "\n";
    });

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.setAttribute("download", "reporte.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Eventos principales
buscarBtn.addEventListener("click", async () => {
    const desde = document.getElementById("periodoDesde").value;
    const hasta = document.getElementById("periodoHasta").value;

    const datos = await obtenerDatos();

    // Filtrar datos según el periodo seleccionado
    const datosFiltrados = datos.filter(dato => {
        const fechaIngreso = new Date(dato["Fecha de Ingreso"]);
        return (!desde || fechaIngreso >= new Date(desde)) &&
               (!hasta || fechaIngreso <= new Date(hasta));
    });

    renderizarTabla(datosFiltrados);
});

filtrarBtn.addEventListener("click", () => {
    const seleccionados = $('#campos-tabla').val();
    filtrarColumnas(seleccionados);
});

exportarBtn.addEventListener("click", exportarCSV);

// Inicialización
document.addEventListener("DOMContentLoaded", async () => {
    generarOpciones();
    const datos = await obtenerDatos();
    renderizarTabla(datos);
});
