import { db } from "../firebaseConfig.js"; // Importar Firestore configurado
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js"; // Importar funciones necesarias

// Lógica para alternar pestañas
document.addEventListener("DOMContentLoaded", () => {
    // Referencia a la pestaña inicial
    const reporteTab = document.getElementById("reporte-tab-content");
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
                tab.style.display = "none";
            });

            // Mostrar la pestaña seleccionada
            const tabId = button.getAttribute("data-tab");
            const selectedTab = document.getElementById(`${tabId}-tab-content`);
            if (selectedTab) {
                selectedTab.style.display = "block";
            } else {
                console.error(`No se encontró la pestaña con ID: ${tabId}-tab-content`);
            }

            // Actualizar el botón activo
            document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
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

    if (tipo === "distribucion") {
        graficoActual = new Chart(graficoCanvas, {
            type: "bar",
            data: {
                labels: datos.abogados,
                datasets: datos.estados.map((estado, index) => ({
                    label: estado.nombre,
                    data: estado.valores.map(value => (value === 0 ? null : value)), // Reemplaza 0 por null
                    backgroundColor: `rgba(${index * 50}, ${100 + index * 20}, ${200 - index * 30}, 0.6)`,
                })),
            },
            options: {
                responsive: true,
                plugins: {
                    datalabels: {
                        display: (context) => context.dataset.data[context.dataIndex] !== null, // Muestra solo si no es null
                        formatter: (value) => value, // Muestra el valor
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
                        formatter: (value) => value, // Muestra el valor sobre cada sección
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
                        formatter: (value) => value, // Muestra el valor en cada punto de la línea
                        color: "#000",
                        font: {
                            weight: "bold",
                        },
                    },
                },
            },
            plugins: [ChartDataLabels],
        });
    }
}


function limpiarPrevisualizacion() {
    const graficoCanvas = document.getElementById("grafico-preview").getContext("2d");
    graficoCanvas.clearRect(0, 0, graficoCanvas.canvas.width, graficoCanvas.canvas.height);
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
const { jsPDF } = window.jspdf;

btnExportarPdf.addEventListener("click", () => {
    const pdf = new jsPDF();
    pdf.text("Reporte de Gráficos", 10, 10);
    pdf.addImage(graficoCanvas.toDataURL("image/png"), "PNG", 10, 20, 190, 100);
    pdf.save("reporte.pdf");
});

// Inicializar filtros al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
    await cargarAbogados();
    await cargarEstados();
});



