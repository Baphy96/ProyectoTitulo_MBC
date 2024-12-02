import { db } from "../firebaseConfig.js"; // Importar Firestore configurado
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js"; // Importar funciones necesarias
import { checkUserRole } from './roleManager.js'; 

document.addEventListener('DOMContentLoaded', function () {
  // Verificar el rol del usuario y manejar los módulos visibles
  checkUserRole();

// Lógica para alternar pestañas
document.addEventListener("DOMContentLoaded", () => {
    // Mostrar la pestaña inicial
    const reporteTab = document.getElementById("reporte-tab-content"); // ID correcto
    if (reporteTab) {
        reporteTab.style.display = "block"; // Mostrar la pestaña inicial
    } else {
        console.error("No se encontró la pestaña con ID: reporte-tab-content");
    }

    // Lógica para alternar pestañas
    document.querySelectorAll(".tab-button").forEach(button => {
        button.addEventListener("click", () => {
            // Ocultar todas las pestañas
            document.querySelectorAll(".tab-content").forEach(tab => {
                tab.style.display = "none"; // Ocultar contenido
            });

            // Mostrar la pestaña seleccionada
            const tabId = button.getAttribute("data-tab");
            const selectedTab = document.getElementById(`${tabId}-tab-content`);
            if (selectedTab) {
                selectedTab.style.display = "block"; // Mostrar contenido
            } else {
                console.error(`No se encontró la pestaña con ID: ${tabId}-tab-content`);
            }

            // Actualizar el botón activo
            document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
            button.classList.add("active"); // Añadir clase activa al botón actual
        });
    });
});

// Mostrar la pestaña inicial por defecto
document.getElementById("reporte-tab-content").style.display = "block";

// Referencias al DOM
const selectCampos = document.getElementById("campos-tabla");
const tableBody = document.getElementById("resultsTableBody");
const buscarBtn = document.getElementById("buscar");
const exportarBtn = document.getElementById("exportar-btn");
const exportarMenu = document.getElementById("exportar-menu");
const filtrarBtn = document.getElementById("filtrar-btn");

// Obtener datos desde Firestore
async function obtenerDatos() {
    try {
        const gestionCausasRef = collection(db, "causas");
        const honorariosRef = collection(db, "honorarios");

        const gestionCausasSnap = await getDocs(gestionCausasRef);
        const honorariosSnap = await getDocs(honorariosRef);

        const datosConsolidados = {};

        // Procesar causas
        gestionCausasSnap.docs.forEach(doc => {
            const causa = doc.data();
            if (!datosConsolidados[causa.rol]) {
                datosConsolidados[causa.rol] = { ...causa, pagos: [] };
            }
        });

        // Procesar honorarios
        honorariosSnap.docs.forEach(doc => {
            const honorario = doc.data();
            if (!datosConsolidados[honorario.rol]) {
                datosConsolidados[honorario.rol] = { pagos: [] };
            }

            datosConsolidados[honorario.rol] = {
                ...datosConsolidados[honorario.rol],
                rut: honorario.rutCliente || "-",
                nombreCliente: honorario.nombreCliente || "-",
                tipoDocumento: honorario.tipoDocumento || "-",
                numeroDocumento: honorario.numeroDocumento || "-",
                fechaDocumento: honorario.fechaDocumento || "-",
                monto: honorario.monto || 0
            };

            // Agregar pagos si existen
            if (Array.isArray(honorario.pagos)) {
                honorario.pagos.forEach(pago => {
                    datosConsolidados[honorario.rol].pagos.push({
                        monto: pago.monto,
                        fechaPago: pago.fechaPago,
                        tipoPago: pago.tipoPago,
                        numeroDocumentoPago: pago.numDocumentoPago || "-"
                    });
                });
            }
        });

        // Convertir a un array para procesarlo
        console.log("Datos consolidados con pagos:", datosConsolidados);
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
        const headerText = header.textContent.trim();
        option.value = headerText;
        option.textContent = headerText;
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
    const tableBody = document.getElementById("resultsTableBody");
    tableBody.innerHTML = ""; // Limpiar la tabla

    datos.forEach(dato => {
        const row = document.createElement("tr");

        // Cálculo de total de abonos
        const totalAbono = Array.isArray(dato.pagos)
            ? dato.pagos.reduce((sum, pago) => sum + (parseFloat(pago.monto) || 0), 0)
            : 0;

        // Cálculo de saldo
        const saldo = (dato.monto || 0) - totalAbono;

          // Obtener asistentes legales como una lista separada por comas
          const asistentesLegales = Array.isArray(dato.asistentesLegales)
          ? dato.asistentesLegales.join(", ") // Concatenar con comas
          : "-"; // Mostrar "-" si no hay asistentes


        // Renderizado de fila
        row.innerHTML = `
            <td>${dato.rut || "-"}</td>
            <td>${dato.nombreCliente || "-"}</td>
            <td>${dato.rol || "-"}</td>
            <td>${dato.tipoServicio || "-"}</td>
            <td>${dato.fechaIngreso || "-"}</td>
            <td>${dato.abogadoResponsable || "-"}</td>
            <td>${asistentesLegales}</td>
            <td>${dato.tribunal || "-"}</td>
            <td>${dato.demandado || "-"}</td>
            <td>${dato.receptorJudicial || "-"}</td>
            <td>${dato.abogadoCoordinador || "-"}</td>
            <td>${dato.estado || "-"}</td>
            <td>${dato.tipoDocumento || "-"}</td>
            <td>${dato.numeroDocumento || "-"}</td>
            <td>${dato.fechaDocumento || "-"}</td>
            <td>${dato.monto || 0}</td>
            <td>${totalAbono}</td>
            <td>${saldo}</td>
        `;

        tableBody.appendChild(row);
    });
    

    // Si no hay datos, mostrar un mensaje
    if (datos.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="18" class="text-center">No se encontraron datos</td>`;
        tableBody.appendChild(row);
    }

    

     // Inicializa o refresca DataTables
     if (!$.fn.DataTable.isDataTable("#reportesTable")) {
        $('#reportesTable').DataTable({
            scrollX: true, // Habilita el desplazamiento horizontal
            autoWidth: false, // Evita el ajuste automático de las columnas
            columnDefs:  [
                {
                    targets: [15, 16, 17], // Índices de las columnas Monto, Abono, Saldo
                    render: function(data, type, row) {
                        if (type === 'display') {
                            return new Intl.NumberFormat('es-CL').format(data); // Formato con separadores
                        }
                        return data; // Para exportar o filtrar, usa el valor original
                    }
                },
                {
                    targets: [4, 14], // Índices de las columnas Fecha de Ingreso y Fecha de Documento
                    render: function(data, type, row) {
                        if (type === 'display' && data) {
                            const fecha = new Date(data); // Convierte la fecha a objeto Date
                            const dia = String(fecha.getDate()).padStart(2, '0'); // Día con dos dígitos
                            const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Mes con dos dígitos
                            const anio = String(fecha.getFullYear()).slice(-4); // Últimos dos dígitos del año
                            return `${dia}-${mes}-${anio}`; // Formato dd-mm-aa
                        }
                        return data; // Para exportar o filtrar, usa el valor original
                    }
                },
                { targets: "_all", className: "dt-center" } // Centra todas las columnas
            ],
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
                emptyTable: "No hay datos disponibles en la tabla"
            }
        });
    } else {
        $('#reportesTable').DataTable().draw(); // Refrescar tabla
    }
}


// Filtrar columnas según opciones seleccionadas
function filtrarColumnas(camposSeleccionados) {
    // Referencia a la instancia de DataTables
    const tabla = $('#reportesTable').DataTable();

    // Iterar sobre las columnas de DataTables
    tabla.columns().every(function(index) {
        const header = $(this.header()).text().trim(); // Obtener el nombre del encabezado de la columna
        const visible = camposSeleccionados.includes(header); // Verificar si el campo está seleccionado
        console.log(`Columna: ${header}, visible: ${visible}`); // Debug: imprimir estado de visibilidad
        tabla.column(index).visible(visible); // Mostrar u ocultar la columna
    });

    // Ajustar y redibujar la tabla para aplicar los cambios
    tabla.columns.adjust().draw();
}


// Cerrar el menú al hacer clic fuera de él
document.addEventListener("click", (e) => {
    if (!exportarBtn.contains(e.target) && !exportarMenu.contains(e.target)) {
        exportarMenu.style.display = "none";
    }
});

// Función para exportar a CSV
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

// Función para exportar a Excel
function exportarExcel() {
    const headers = Array.from(document.querySelectorAll("#reportesTable thead th"))
        .filter(th => th.style.display !== "none")
        .map(th => th.textContent.trim());

    const rows = Array.from(document.querySelectorAll("#reportesTable tbody tr")).map(row =>
        Array.from(row.querySelectorAll("td"))
            .filter(td => td.style.display !== "none")
            .map(td => td.textContent.trim())
    );

    // Crear el libro de Excel usando XLSX
    const wb = XLSX.utils.book_new();
    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");

    // Descargar el archivo Excel
    XLSX.writeFile(wb, "reporte.xlsx");
}

// Asocia las funciones a las opciones del menú
document.getElementById("exportar-csv").addEventListener("click", (e) => {
    e.preventDefault(); // Evita el comportamiento por defecto del enlace
    exportarCSV();
    exportarMenu.style.display = "none"; // Oculta el menú
});

document.getElementById("exportar-excel").addEventListener("click", (e) => {
    e.preventDefault(); // Evita el comportamiento por defecto del enlace
    exportarExcel();
    exportarMenu.style.display = "none"; // Oculta el menú
});

// Eventos principales
buscarBtn.addEventListener("click", async () => {
    // Obtener los valores de los campos de período
    const desde = document.getElementById("periodoDesde").value;
    const hasta = document.getElementById("periodoHasta").value;

    console.log("Filtrando por período:", { desde, hasta });

    try {
        // Obtener todos los datos
        const datos = await obtenerDatos();
        console.log("Datos originales obtenidos:", datos);

        // Filtrar los datos según el período
        const datosFiltrados = datos.filter(dato => {
            const fechaIngreso = dato.fechaIngreso ? new Date(dato.fechaIngreso) : null;

            if (!fechaIngreso) return false; // Excluir registros sin fecha válida

            console.log("Comparando fechas:", {
                fechaIngreso,
                desde: desde ? new Date(desde) : "Sin límite inferior",
                hasta: hasta ? new Date(hasta) : "Sin límite superior",
            });

            // Verificar si la fecha está dentro del rango
            return (!desde || fechaIngreso >= new Date(desde)) &&
                   (!hasta || fechaIngreso <= new Date(hasta));
        });

        console.log("Datos filtrados:", datosFiltrados);

        // Actualizar la tabla con los datos filtrados
        const tabla = $('#reportesTable').DataTable(); // Referencia a DataTables
        tabla.clear(); // Limpiar datos existentes
        datosFiltrados.forEach(dato => {
            // Agregar fila a DataTables
            tabla.row.add([
                dato.rut || "-",
                dato.nombreCliente || "-",
                dato.rol || "-",
                dato.tipoServicio || "-",
                dato.fechaIngreso || "-",
                dato.abogadoResponsable || "-",
                dato.asistentesLegales?.join(", ") || "-",
                dato.tribunal || "-",
                dato.demandado || "-",
                dato.receptorJudicial || "-",
                dato.abogadoCoordinador || "-",
                dato.estado || "-",
                dato.tipoDocumento || "-",
                dato.numeroDocumento || "-",
                dato.fechaDocumento || "-",
                dato.monto || 0,
                dato.pagos ? dato.pagos.reduce((sum, pago) => sum + (parseFloat(pago.monto) || 0), 0) : 0,
                (dato.monto || 0) - (dato.pagos ? dato.pagos.reduce((sum, pago) => sum + (parseFloat(pago.monto) || 0), 0) : 0),
            ]);
        });
        tabla.draw(); // Refrescar la tabla con los datos actualizados
    } catch (error) {
        console.error("Error al consultar datos:", error);
    }
});


document.getElementById("filtrar-btn").addEventListener("click", () => {
    // Obtener los campos seleccionados en el filtro
    const camposSeleccionados = $('#campos-tabla').val(); // Array con los nombres de las columnas seleccionadas
    console.log("Campos seleccionados:", camposSeleccionados);

    // Llamar a la función para filtrar las columnas
    filtrarColumnas(camposSeleccionados);
});


// Mostrar/Ocultar el menú al hacer clic en el botón
exportarBtn.addEventListener("click", () => {
    exportarMenu.style.display = exportarMenu.style.display === "none" ? "block" : "none";
});


// Inicialización
document.addEventListener("DOMContentLoaded", async () => {
    generarOpciones();
    const datos = await obtenerDatos();
    renderizarTabla(datos);
});


// ==================== Funcionalidades para "Gráficos" ====================

// Referencias al DOM
const btnDistribucion = document.getElementById("btn-distribucion");
const btnEstadoPago = document.getElementById("btn-estado-pago");
const btnHonorariosAcumulados = document.getElementById("btn-honorarios-acumulados");
const btnBuscar = document.getElementById("btn-buscar");
const btnExportarPdf = document.getElementById("btn-exportar-pdf");
const filtrosContainer = document.getElementById("filtros-container");
const graficoCanvas = document.getElementById("grafico-preview");

const filtrosDistribucion = document.getElementById("filtros-distribucion");
const filtrosPagoHonorarios = document.getElementById("filtros-pago-honorarios");
const filtrosHonorariosAcumulados = document.getElementById("filtros-honorarios-acumulados");

// Filtros individuales
const filtroAbogado = document.getElementById("filtroAbogado");
const filtroEstado = document.getElementById("filtroEstado");
const filtroPeriodoDesde = document.getElementById("periodoDesde");
const filtroPeriodoHasta = document.getElementById("periodoHasta");

// Variable para almacenar el gráfico actual
let graficoActual;

// ========= Funciones de carga de datos ===============

// Función para cargar abogados dinámicamente en el filtro
async function cargarAbogados() {
    try {
        // Referencia a la colección "Entidades"
        const entidadesRef = collection(db, "Entidades");

        // Crear una consulta para obtener documentos donde TipoEntidad sea "Abogado"
        const abogadosQuery = query(entidadesRef, where("TipoEntidad", "==", "Abogado"));

        // Ejecutar la consulta
        const querySnapshot = await getDocs(abogadosQuery);

        // Limpiar el contenido previo del filtro
        const filtroAbogado = document.getElementById("filtroAbogado");
        filtroAbogado.innerHTML = "";

        // Iterar sobre los documentos y agregar opciones al filtro
        querySnapshot.forEach(doc => {
            const data = doc.data();
            const option = document.createElement("option");
            option.value = data.Nombre; // Usar el nombre del abogado
            option.textContent = data.Nombre;
            filtroAbogado.appendChild(option);
        });

        // Inicializar Bootstrap Multiselect
        $('#filtroAbogado').multiselect({
            includeSelectAllOption: true,
            nonSelectedText: 'Seleccionar Abogados',
            selectAllText: 'Seleccionar Todos',
            allSelectedText: 'Todos seleccionados',
            nSelectedText: 'seleccionados',
            buttonWidth: '100%',
            enableFiltering: true,
            filterPlaceholder: 'Buscar abogado...',
        });
    } catch (error) {
        console.error("Error al cargar los abogados desde Firebase:", error);
    }
}

// Llamar a la función para cargar los abogados al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    cargarAbogados();
});

// Función para cargar estados dinámicamente en el filtro
async function cargarEstados() {
    try {
        // Referencia a la colección "EstadoJudicial"
        const estadoJudicialRef = collection(db, "EstadoJudicial");

        // Obtener todos los documentos de la colección
        const querySnapshot = await getDocs(estadoJudicialRef);

        // Limpiar el contenido previo del filtro
        const filtroEstado = document.getElementById("filtroEstado");
        filtroEstado.innerHTML = "";

        // Iterar sobre los documentos y agregar opciones al filtro
        querySnapshot.forEach(doc => {
            const data = doc.data();
            const option = document.createElement("option");
            option.value = data.Descripcion; // Usar el campo "Descripción"
            option.textContent = data.Descripcion;
            filtroEstado.appendChild(option);
        });

        // Inicializar Bootstrap Multiselect
        $('#filtroEstado').multiselect({
            includeSelectAllOption: true,
            nonSelectedText: 'Seleccionar Estados',
            selectAllText: 'Seleccionar Todos',
            allSelectedText: 'Todos seleccionados',
            nSelectedText: 'seleccionados',
            buttonWidth: '100%',
            enableFiltering: true,
            filterPlaceholder: 'Buscar estado...',
        });
    } catch (error) {
        console.error("Error al cargar los estados desde Firebase:", error);
    }
}

// Llamar a la función para cargar los estados al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    cargarEstados();
});

// ========= Funciones para obtener datos ===============

// Obtener Datos para el Gráfico de Distribución
async function obtenerDatosDistribucion() {
    try {
        const causasRef = collection(db, "causas");
        const querySnapshot = await getDocs(causasRef);

        // Obtener valores de los filtros
        const estadoSeleccionado = $('#filtroEstado').val(); // Estados seleccionados
        const abogadoSeleccionado = $('#filtroAbogado').val(); // Abogados seleccionados
        const periodoDesde = document.getElementById("periodoDesdeDistribucion").value; // Periodo desde
        const periodoHasta = document.getElementById("periodoHastaDistribucion").value; // Periodo hasta

        const datos = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            const fechaIngreso = new Date(data.fechaIngreso);

            // Aplicar filtros: período, estado y abogado
            const cumpleEstado = !estadoSeleccionado || estadoSeleccionado.includes(data.estado);
            const cumplePeriodo =
                (!periodoDesde || fechaIngreso >= new Date(periodoDesde)) &&
                (!periodoHasta || fechaIngreso <= new Date(periodoHasta));

            // Incluir abogado responsable si cumple con los filtros
            if (
                data.abogadoResponsable &&
                cumpleEstado &&
                cumplePeriodo &&
                (!abogadoSeleccionado || abogadoSeleccionado.includes(data.abogadoResponsable))
            ) {
                datos.push({
                    abogado: data.abogadoResponsable,
                    estado: data.estado,
                    fecha: data.fechaIngreso,
                });
            }

            // Incluir asistentes legales si cumplen con los filtros
            if (data.asistentesLegales && Array.isArray(data.asistentesLegales)) {
                data.asistentesLegales.forEach(asistente => {
                    if (
                        cumpleEstado &&
                        cumplePeriodo &&
                        (!abogadoSeleccionado || abogadoSeleccionado.includes(asistente))
                    ) {
                        datos.push({
                            abogado: asistente,
                            estado: data.estado,
                            fecha: data.fechaIngreso,
                        });
                    }
                });
            }
        });

        // Procesar datos para el gráfico
        const abogados = [...new Set(datos.map(d => d.abogado))]; // Lista única de abogados y asistentes
        const estados = [...new Set(datos.map(d => d.estado))]; // Lista única de estados

        const resultado = {
            abogados,
            estados: estados.map(estado => ({
                nombre: estado,
                valores: abogados.map(abogado => {
                    return datos.filter(d => d.abogado === abogado && d.estado === estado).length;
                }),
            })),
        };

        return resultado;
    } catch (error) {
        console.error("Error al obtener datos de distribución:", error);
        return { abogados: [], estados: [] };
    }
}


// Obtener Datos para el Gráfico de Estado de Pago
async function obtenerDatosEstadoPago() {
    try {
        const honorariosRef = collection(db, "honorarios");
        const querySnapshot = await getDocs(honorariosRef);

        let pagados = 0;
        let pendientes = 0;

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const saldo = data.monto - (data.pagos?.reduce((acc, pago) => acc + (pago.monto || 0), 0) || 0);
            if (saldo > 0) {
                pendientes++;
            } else {
                pagados++;
            }
        });

        return { pagados, pendientes };
    } catch (error) {
        console.error("Error al obtener datos de estado de pago:", error);
        return { pagados: 0, pendientes: 0 };
    }
}

// Obtener Datos para el Gráfico de Honorarios Acumulados
async function obtenerDatosHonorariosAcumulados() {
    try {
        const honorariosRef = collection(db, "honorarios");
        const querySnapshot = await getDocs(honorariosRef);

        const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const valores = Array(12).fill(0);

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const fecha = new Date(data.fechaDocumento);
            const mes = fecha.getMonth();
            valores[mes] += data.monto || 0;
        });

        return { meses, valores };
    } catch (error) {
        console.error("Error al obtener datos de honorarios acumulados:", error);
        return { meses: [], valores: [] };
    }
}

// ========= Función para renderizar gráficos ===============
function renderizarGrafico(tipo, datos) {
    if (graficoActual) graficoActual.destroy(); // Limpiar gráfico anterior

    // Referencia al elemento de monto acumulado
    const montoAcumuladoElement = document.getElementById("monto-acumulado");
    if (montoAcumuladoElement) {
        // Limpiar el contenido del monto acumulado antes de generar un nuevo gráfico
        montoAcumuladoElement.textContent = "";
    }

    if (tipo === "distribucion") {
        // Calcular el total de casos para el gráfico de distribución
        const totalCasos = datos.estados.reduce((sum, estado) => {
            return sum + estado.valores.reduce((subSum, value) => subSum + value, 0);
        }, 0);

        graficoActual = new Chart(graficoCanvas, {
            type: "bar",
            data: {
                labels: datos.abogados,
                datasets: datos.estados.map((estado, index) => ({
                    label: estado.nombre,
                    data: estado.valores,
                    backgroundColor: `rgba(${index * 50}, ${100 + index * 20}, ${200 - index * 30}, 0.6)`,
                })),
            },
            options: {
                responsive: true,
                plugins: {
                    datalabels: {
                        formatter: (value, context) => {
                            if (value === 0) return ""; // No mostrar valores 0
                            const porcentaje = totalCasos > 0 ? ((value / totalCasos) * 100).toFixed(2) : 0;
                            return `${value} (${porcentaje}%)`; // Mostrar valor y porcentaje
                        },
                        display: (context) => context.dataset.data[context.dataIndex] !== 0, // Solo mostrar si el valor no es 0
                        color: "#000",
                        font: {
                            weight: "bold",
                        },
                    },
                },
                scales: {
                    x: { stacked: true },
                    y: { stacked: true },
                },
            },
            plugins: [ChartDataLabels],
        });
    } else if (tipo === "estadoPago") {
        // Calcular el total de pagos
        const totalPagos = datos.pagados + datos.pendientes;

        graficoActual = new Chart(graficoCanvas, {
            type: "doughnut",
            data: {
                labels: ["Pagados", "Pendientes"],
                datasets: [
                    {
                        data: [datos.pagados, datos.pendientes],
                        backgroundColor: ["#36a2eb", "#ff6384"],
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    datalabels: {
                        formatter: (value, context) => {
                            if (value === 0) return ""; // No mostrar valores 0
                            const porcentaje = totalPagos > 0 ? ((value / totalPagos) * 100).toFixed(2) : 0;
                            return `${value} (${porcentaje}%)`; // Mostrar valor y porcentaje
                        },
                        display: (context) => context.dataset.data[context.dataIndex] !== 0, // Solo mostrar si el valor no es 0
                        color: "#000",
                        font: {
                            weight: "bold",
                        },
                    },
                },
            },
            plugins: [ChartDataLabels],
        });
    } else if (tipo === "honorariosAcumulados") {
        // Calcular el total de honorarios acumulados
        const totalHonorarios = datos.valores.reduce((sum, value) => sum + value, 0);

        graficoActual = new Chart(graficoCanvas, {
            type: "line",
            data: {
                labels: datos.meses,
                datasets: [
                    {
                        label: "Honorarios",
                        data: datos.valores,
                        borderColor: "#36a2eb",
                        fill: false,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    datalabels: {
                        formatter: (value, context) => {
                            if (value === 0) return ""; // No mostrar valores 0
                            return new Intl.NumberFormat('es-CL').format(value); // Formato con separador de miles
                        },
                        display: (context) => context.dataset.data[context.dataIndex] !== 0, // Solo mostrar si el valor no es 0
                        color: "#000",
                        font: {
                            weight: "bold",
                        },
                    },
                },
            },
            plugins: [ChartDataLabels],
        });

        // Mostrar el monto acumulado por periodo filtrado al final del gráfico
        if (montoAcumuladoElement) {
            montoAcumuladoElement.textContent = `Monto acumulado del período: ${new Intl.NumberFormat('es-CL').format(totalHonorarios)}`;
        }
    }
}




function limpiarPrevisualizacion() {
    // Limpiar el canvas
    graficoCanvas.getContext("2d").clearRect(0, 0, graficoCanvas.width, graficoCanvas.height);

    // Si hay un gráfico actual, destruirlo
    if (graficoActual) {
        graficoActual.destroy();
        graficoActual = null; // Asegurarse de que no haya referencia al gráfico anterior
    }
}


// ========= Función para filtros ===============

// Función para manejar el estado activo y mostrar los filtros correspondientes
function activarBoton(btnId) {
    // Remover la clase active de todos los botones
    document.querySelectorAll(".btn-report").forEach(btn => btn.classList.remove("active"));

    // Agregar la clase active al botón seleccionado
    const boton = document.getElementById(btnId);
    if (boton) {
        boton.classList.add("active");
    }
}



// Función para mostrar los filtros específicos
function mostrarFiltros(tipo) {
    // Mostrar el contenedor de filtros si está oculto
    const filtrosContainer = document.getElementById("filtros-container");
    filtrosContainer.style.display = "block";

    // Ocultar todos los contenedores de filtros
    document.getElementById("filtros-distribucion").style.display = "none";
    document.getElementById("filtros-pago-honorarios").style.display = "none";
    document.getElementById("filtros-honorarios-acumulados").style.display = "none";

    // Mostrar el contenedor de filtros correspondiente
    if (tipo === "distribucion") {
        document.getElementById("filtros-distribucion").style.display = "flex";
    } else if (tipo === "estadoPago") {
        document.getElementById("filtros-pago-honorarios").style.display = "flex";
    } else if (tipo === "honorariosAcumulados") {
        document.getElementById("filtros-honorarios-acumulados").style.display = "flex";
    }
}




// ========= Eventos ===============
// Eventos para los botones de los reportes
document.getElementById("btn-distribucion").addEventListener("click", () => {
    activarBoton("btn-distribucion");
    mostrarFiltros("distribucion");
    limpiarPrevisualizacion();
});

document.getElementById("btn-estado-pago").addEventListener("click", () => {
    activarBoton("btn-estado-pago");
    mostrarFiltros("estadoPago");
    limpiarPrevisualizacion();
});

document.getElementById("btn-honorarios-acumulados").addEventListener("click", () => {
    activarBoton("btn-honorarios-acumulados");
    mostrarFiltros("honorariosAcumulados");
    limpiarPrevisualizacion();
});

// Evento del botón buscar
btnBuscar.addEventListener("click", async () => {
    limpiarPrevisualizacion(); // Limpiar siempre antes de renderizar un nuevo gráfico
    
    // Aquí implementa la lógica para obtener datos y renderizar gráficos
    const tipo = document.querySelector(".btn-report.active").id;
    if (tipo === "btn-distribucion") {
        // Lógica para gráfico de distribución
        const datos = await obtenerDatosDistribucion(); // Implementar esta función
        renderizarGrafico("distribucion", datos);
    } else if (tipo === "btn-estado-pago") {
        // Lógica para gráfico de estado de pago
        const datos = await obtenerDatosEstadoPago(); // Implementar esta función
        renderizarGrafico("estadoPago", datos);
    } else if (tipo === "btn-honorarios-acumulados") {
        // Lógica para gráfico de honorarios acumulados
        const datos = await obtenerDatosHonorariosAcumulados(); // Implementar esta función
        renderizarGrafico("honorariosAcumulados", datos);
    }
});

// Evento para exportar gráfico como PDF
// Extraer jsPDF desde la librería que está en el espacio de nombres
const { jsPDF } = window.jspdf;

// Evento para exportar toda la sección de previsualización como PDF
btnExportarPdf.addEventListener("click", () => {
    // Seleccionar el gráfico dentro de la tarjeta en lugar de la tarjeta completa
    const graficoCanvas = document.getElementById("grafico-preview");

    // Validar que el elemento tenga dimensiones válidas antes de la captura
    const rect = graficoCanvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
        console.error("El elemento #grafico-preview tiene dimensiones no válidas para ser capturado.");
        return;
    }

    // Esperar un momento para asegurar que el gráfico se haya renderizado correctamente
    setTimeout(() => {
        // Utilizar html2canvas para capturar el gráfico
        html2canvas(graficoCanvas, { scale: 3, useCORS: true, crossOrigin: 'anonymous' }).then((canvas) => {
            try {
                // Validar las dimensiones del canvas
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;

                if (!canvasWidth || !canvasHeight || canvasWidth <= 0 || canvasHeight <= 0) {
                    throw new Error("Canvas dimensions are invalid.");
                }

                // Crear una instancia de jsPDF
                const pdf = new jsPDF({
                    orientation: "portrait", // Orientación del PDF
                    unit: "px",
                    format: "a4"
                });

                // Añadir título y fecha al PDF con estilo más claro
                pdf.setFontSize(20);
                pdf.setTextColor("#003366");
                pdf.text("Reporte de Gráficos", 20, 30);

                pdf.setFontSize(12);
                pdf.setTextColor("#333333");
                pdf.text(`Fecha de generación: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 50);

                // Convertir el canvas a imagen en formato JPEG para mayor compatibilidad y calidad
                const imgData = canvas.toDataURL("image/jpeg", 0.9);

                // Calcular el ancho y alto del PDF en función del tamaño A4
                const pdfWidth = pdf.internal.pageSize.getWidth() - 40; // Ancho disponible con márgenes laterales de 20px
                const pdfHeight = pdf.internal.pageSize.getHeight() - 90; // Alto disponible con margen superior de 60px y margen inferior de 30px

                // Mantener la proporción al ajustar el tamaño de la imagen al PDF
                let ratio = Math.min(pdfWidth / canvasWidth, pdfHeight / canvasHeight);

                // Validación de ratio
                if (isNaN(ratio) || ratio <= 0) {
                    ratio = 1; // Valor predeterminado si el cálculo del ratio no es válido
                }

                const imgWidth = canvasWidth * ratio;
                const imgHeight = canvasHeight * ratio;

                // Validar que las dimensiones calculadas sean válidas
                if (isNaN(imgWidth) || isNaN(imgHeight) || imgWidth <= 0 || imgHeight <= 0) {
                    throw new Error("Calculated image dimensions are invalid.");
                }

                // Añadir la imagen al PDF
                pdf.addImage(imgData, "JPEG", 20, 70, imgWidth, imgHeight);

                // Añadir pie de página
                pdf.setFontSize(10);
                pdf.setTextColor("#666666");
                pdf.text("Este reporte ha sido generado automáticamente por el sistema de gestión.", 20, pdf.internal.pageSize.getHeight() - 20);

                // Guardar el archivo PDF generado
                pdf.save("reporte_grafico.pdf");
            } catch (error) {
                console.error("Error al añadir la imagen al PDF:", error);
            }
        }).catch((error) => {
            console.error("Error al generar el PDF:", error);
        });
    }, 1000); // Retrasar 1000ms para asegurar que el gráfico se haya renderizado correctamente
});


// Inicializar filtros al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
    await cargarAbogados();
    await cargarEstados();
});
});


