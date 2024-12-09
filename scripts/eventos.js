import { db } from "../firebaseConfig.js"; // Importar Firestore configurado
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { checkUserRole } from './roleManager.js'; 

document.addEventListener('DOMContentLoaded', function () {
  // Verificar el rol del usuario y manejar los módulos visibles
  checkUserRole();
});

// Referencias a las colecciones
const eventsCollection = collection(db, "eventos");
const causasCollection = collection(db, "causas");

let selectedDate = null; // Variable para almacenar la fecha seleccionada en el calendario

// Función para cargar los valores del campo "rol" en el desplegable
async function populateRoleDropdown() {
  const roleDropdown = document.getElementById("eventRole");
  roleDropdown.innerHTML = '<option value="" disabled selected>Seleccione</option>'; // Limpiar opciones previas

  try {
    const causasQuery = query(causasCollection);
    const querySnapshot = await getDocs(causasQuery);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.rol) {
        // Agregar cada ROL como una opción en el desplegable
        const option = document.createElement("option");
        option.value = data.rol;
        option.textContent = data.rol;
        roleDropdown.appendChild(option);
      }
    });
  } catch (error) {
    console.error("Error al cargar los roles desde Firestore:", error);
  }
}


// Función para cargar eventos desde Firestore
async function loadEvents(startDate = null, endDate = null) {
  console.log("Iniciando loadEvents");
  const eventSummaryTable = document.getElementById("eventSummary");
  eventSummaryTable.innerHTML = ""; // Limpiar tabla

  const eventQuery = query(eventsCollection);
  const querySnapshot = await getDocs(eventQuery);

  const today = new Date();
  const twoMonthsLater = new Date(today);
  twoMonthsLater.setMonth(today.getMonth() + 2);

  const allEvents = []; // Todos los eventos para el calendario
  const filteredEvents = []; // Eventos filtrados para el resumen
  const seenEventIds = new Set();

  querySnapshot.forEach((doc) => {
    const event = { id: doc.id, ...doc.data() };
  
    // Convertir fecha al formato local desde UTC si es necesario
    const eventDate = new Date(event.fecha.endsWith("Z") ? event.fecha : `${event.fecha}T00:00:00`);
    if (isNaN(eventDate.getTime())) {
      console.warn("Fecha inválida, evento ignorado:", event);
      return;
    }      
 
    // Evitar duplicados
    if (seenEventIds.has(event.id)) {
      console.warn("Evento duplicado ignorado:", event);
      return;
    }

    seenEventIds.add(event.id);
    allEvents.push(event); // Agregar todos los eventos al calendario

    // Filtrar solo eventos futuros o en rango de fechas para el resumen
    if (
      (!startDate && !endDate && eventDate >= today && eventDate <= twoMonthsLater) ||
      (startDate && endDate && eventDate >= new Date(startDate) && eventDate <= new Date(endDate)) ||
      (startDate && !endDate && eventDate >= new Date(startDate)) ||
      (!startDate && endDate && eventDate <= new Date(endDate))
    ) {
      filteredEvents.push(event);

      

      // Agregar evento al resumen
      const row = document.createElement("tr");
      row.innerHTML = `

          <td>${eventDate.toLocaleDateString()}</td>
              <td>${event.tipo}</td>
              <td>${event.rol}</td>
          `;
      eventSummaryTable.appendChild(row);
      console.log("Evento agregado al resumen:", event);
    }
  });

  console.log("Eventos cargados:", allEvents);
  console.log("Eventos filtrados para el resumen:", filteredEvents);

  // Pasar todos los eventos al calendario
  populateCalendar(allEvents);


  // Inicializar DataTables después de cargar los datos
  initializeDataTable();
}

// Extensión personalizada para ordenar fechas en formato DD-MM-YYYY
jQuery.extend(jQuery.fn.dataTable.ext.type.order, {
  "date-dd-mm-yyyy-pre": function (d) {
    // Divide la fecha en partes: [día, mes, año]
    const parts = d.split("-");
    return new Date(parts[2], parts[1] - 1, parts[0]).getTime(); // Devuelve la fecha en milisegundos
  }
});

// Función para inicializar DataTables
function initializeDataTable() {
  // Verifica si DataTables ya está inicializado
  if (!$.fn.DataTable.isDataTable("#eventSummaryTable")) {
    $("#eventSummaryTable").DataTable({
      order: [[0, "asc"]], // Ordena inicialmente por la primera columna (Fecha)
      columnDefs: [
        { type: "date-dd-mm-yyyy", targets: 0 } // Indica que la primera columna es de tipo fecha personalizada
      ],
      language: {
        emptyTable: "No hay datos disponibles en la tabla",
        lengthMenu: "Mostrar _MENU_ entradas por página",
        zeroRecords: "No se encontraron coincidencias",
        info: "Mostrando _START_ a _END_ de _TOTAL_ entradas",
        infoEmpty: "Mostrando 0 a 0 de 0 entradas",
        infoFiltered: "(filtrado de _MAX_ entradas totales)",
        search: "Buscar:",
        paginate: {
          first: "Primero",
          last: "Último",
          next: "Siguiente",
          previous: "Anterior",
        },
        loadingRecords: "Cargando...",
        processing: "Procesando...",
      },
      responsive: true,
      autoWidth: false,
    });
  } else {
    console.log("DataTable ya inicializado, no se requiere reinicialización.");
  }
}



// Función principal para verificar eventos próximos
async function verificarEventosProximos() {
  const eventosProximos = []; // Array para almacenar eventos próximos
  const hoy = new Date();
  const tresDiasDespues = new Date();
  tresDiasDespues.setDate(hoy.getDate() + 3); // Rango de 3 días

  try {
    // Obtener eventos desde Firestore
    const eventosSnapshot = await getDocs(eventsCollection);

    eventosSnapshot.forEach((doc) => {
      const evento = doc.data();
      const fechaEvento = new Date(evento.fecha);

      // Verificar si el evento está dentro del rango de los próximos 3 días
      if (fechaEvento >= hoy && fechaEvento <= tresDiasDespues) {
        eventosProximos.push({ id: doc.id, ...evento });
      }
    });


    // Mostrar notificaciones para los eventos encontrados
    mostrarNotificaciones(eventosProximos);
  } catch (error) {
    console.error("Error al verificar eventos próximos:", error);
  }
}

// Función para mostrar las notificaciones con toasts
function mostrarNotificaciones(eventos) {
  if (eventos.length === 0) return; // No hacer nada si no hay eventos próximos

  eventos.forEach((evento) => {
    mostrarToast(evento); // Llamar a la función para mostrar el toast
  });
}

// Función para mostrar un toast con cierre manual
function mostrarToast(evento) {
  const toastContainer = document.getElementById("toastContainer");

  const toastHTML = `
  <div class="toast align-items-center text-bg-warning border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true" data-autohide="false">
  <div class="toast-header">
      <strong class="me-auto">Próximo evento</strong>
      <!-- Botón de cierre -->
      <button type="button" class="close toast-close" aria-label="Cerrar">
          <span aria-hidden="true">&times;</span>
      </button>
  </div>
  <div class="toast-body">
              <strong>${evento.tipo}</strong> programado para el <em>${new Date(evento.fecha).toLocaleDateString()}</em>.<br>
              <strong>ROL:</strong> ${evento.rol} <br>
              ${evento.descripcion || ""}
          </div>
      </div>
  `;

  // Agregar el toast al contenedor
  toastContainer.innerHTML += toastHTML;

  // Inicializar y mostrar el toast
  const toastEl = toastContainer.lastElementChild;
  $(toastEl).toast({ autohide: false }).toast("show"); // Mostrar el toast con jQuery

  // Agregar evento de cierre manual
  toastEl.querySelector(".toast-close").addEventListener("click", () => {
    $(toastEl).toast("hide"); // Ocultar el toast al hacer clic en el botón de cierre
  });
}


// Manejar el filtro de período
document.getElementById("applyFilterButton").addEventListener("click", async () => {
  const startDate = document.getElementById("filterStartDate").value;
  const endDate = document.getElementById("filterEndDate").value;

  const table = $("#eventSummaryTable").DataTable();

  if (!startDate && !endDate) {
    // Si no hay fechas seleccionadas, cargar eventos desde hoy hasta 2 meses adelante
    table.clear(); // Limpia todas las filas de la tabla

    const querySnapshot = await getDocs(eventsCollection);
    const today = new Date();
    const twoMonthsLater = new Date(today);
    twoMonthsLater.setMonth(today.getMonth() + 2); // Fecha límite: 2 meses desde hoy

    querySnapshot.forEach((doc) => {
      const event = { id: doc.id, ...doc.data() };
      const eventDate = new Date(event.fecha + "T00:00:00"); // Forzar inicio del día en zona horaria local
      

      // Solo agregar eventos desde hoy hasta 2 meses adelante
      if (eventDate >= today && eventDate <= twoMonthsLater) {
        table.row.add([
          eventDate.toLocaleDateString(),
          event.tipo,
          event.rol,
        ]);
      }
    });

    table.draw(); // Redibuja la tabla con los datos actualizados
    console.log("Cargar eventos desde hoy hasta dos meses adelante.");
  } else {
    // Filtrar las filas en DataTables
    table.clear(); // Limpia las filas actuales antes de filtrar
    const querySnapshot = await getDocs(eventsCollection);
    const filteredEvents = [];

    querySnapshot.forEach((doc) => {
      const event = { id: doc.id, ...doc.data() };
      const eventDate = new Date(event.fecha);

      if (
        (!startDate || eventDate >= new Date(startDate)) &&
        (!endDate || eventDate <= new Date(endDate))
      ) {
        filteredEvents.push(event);
        table.row.add([
          eventDate.toLocaleDateString(),
          event.tipo,
          event.rol,
        ]);
      }
    });

    table.draw(); // Redibuja la tabla con los eventos filtrados
    console.log("Cargar eventos con el rango especificado:", filteredEvents);
  }
});



// Inicializar eventos al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
  await populateRoleDropdown(); // Llenar el campo ROL / Año
  await loadEvents(); // Cargar eventos en el resumen y calendario 
   await verificarEventosProximos(); // Verificar eventos próximos y mostrar toasts
});

// Verificar eventos en intervalos regulares (opcional)
setInterval(() => {
  verificarEventosProximos();
}, 3 * 60 * 60 * 1000); // Cada 3 horas


// Función para agregar un nuevo evento
async function addEvent(eventData) {
  try {
    const simpleDate = new Date(eventData.fecha).toISOString().split("T")[0];
    const eventDataFormatted = {
      ...eventData,
      fecha: simpleDate,
      tipo: eventData.tipo.trim(),
    };

    await addDoc(eventsCollection, eventDataFormatted);
    alert("Evento guardado con éxito.");

    // Recargar la tabla completa para evitar inconsistencias
    await loadEvents();

  } catch (error) {
    console.error("Error al agregar evento:", error);
    alert("No se pudo guardar el evento. Intente nuevamente.");
  }
}



// Función para actualizar un evento
async function updateEvent(eventId, updatedData) {
  if (!eventId || !updatedData) {
    alert("Faltan datos para actualizar el evento.");
    return;
  }

  try {
    const eventRef = doc(eventsCollection, eventId); // Referencia al documento
    await updateDoc(eventRef, updatedData); // Actualizar el evento en Firestore
    alert("Evento actualizado correctamente."); // Notificar al usuario
    await loadEvents(); // Recargar eventos en el calendario y resumen
    console.log("Evento actualizado:", updatedData); // Registro de confirmación
  } catch (error) {
    console.error("Error al actualizar evento:", error); // Manejar error correctamente
    alert("Hubo un error al intentar actualizar el evento. Intente nuevamente.");
  }
}

// Función para eliminar un evento
async function deleteEvent(eventId) {
  if (!eventId) {
    alert("No se ha proporcionado un ID de evento para eliminar.");
    return;
  }

  const confirmDelete = confirm("¿Está seguro de que desea eliminar este evento?");
  if (!confirmDelete) return; // Detener si el usuario cancela

  try {
    const eventRef = doc(eventsCollection, eventId); // Referencia al documento
    await deleteDoc(eventRef); // Eliminar el evento de Firestore
    alert("Evento eliminado correctamente."); // Notificar al usuario

    await loadEvents(); // Recargar eventos en el calendario y resumen
    console.log("Evento eliminado con ID:", eventId); // Registro de confirmación
  } catch (error) {
    console.error("Error al eliminar evento:", error); // Manejar error correctamente
    alert("Hubo un error al intentar eliminar el evento. Intente nuevamente.");
  }
}


// Función para llenar eventos en el calendario
function populateCalendar(events) {
  const calendarEl = document.getElementById("calendar");
  const today = new Date(); // Fecha actual

  const calendar = new FullCalendar.Calendar(calendarEl, {
    timeZone: "local", // Usa la zona horaria local del cliente
    initialView: "dayGridMonth", // Vista inicial del calendario
    locale: "es", // Idioma en español
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    buttonText: {
      today: "Hoy",
      month: "Mes",
      week: "Semana",
      day: "Día",
    },
    editable: true, // Permitir mover eventos
    selectable: true, // Permitir seleccionar fechas
    events: events.map((event) => {
      const eventDate = new Date(event.fecha + "T00:00:00"); // Convertir a inicio del día en zona local
      let eventClass = "";

      // Asignar clase según el tipo de evento
      switch (event.tipo.toLowerCase()) {
        case "audiencia":
          eventClass = "event-audiencia"; // Clase para audiencia
          break;
        case "reunion":
          eventClass = "event-reunion"; // Clase para reunión
          break;
        case "plazo":
          eventClass = "event-plazo"; // Clase para plazo
          break;
        default:
          eventClass = "event-default"; // Clase predeterminada
      }

      // Si el evento ya pasó, sobrescribir con la clase para eventos pasados
      if (eventDate < today) {
        eventClass = "event-past";
      }

      return {
        id: event.id,
        title: event.tipo,
        start: eventDate,
        description: event.descripcion || "",
        rol: event.rol || "",
        className: eventClass, // Clase personalizada
      };
    }),
    dateClick: function (info) {
      // Capturar la fecha seleccionada
      const selectedDate = info.dateStr; // Formato YYYY-MM-DD

      // Limpiar los campos del modal
      document.getElementById("eventDate").value = selectedDate; // Prellenar con la fecha seleccionada
      document.getElementById("eventType").value = ""; // Limpiar tipo de evento
      document.getElementById("eventRole").value = ""; // Limpiar ROL / Año
      document.getElementById("eventDescription").value = ""; // Limpiar descripción

      // Abrir el modal de agregar evento
      $("#addEventModal").modal("show");
    },
    eventMouseEnter: function (info) {
      // Crear un tooltip dinámico
      const tooltip = document.createElement("div");
      tooltip.className = "tooltip-event";
      tooltip.innerHTML = `
          <strong>${info.event.title}</strong><br>
          <em>Fecha:</em> ${info.event.start.toLocaleDateString()}<br>
          <em>ROL:</em> ${info.event.extendedProps.rol}<br>
          <em>Descripción:</em> ${info.event.extendedProps.description}
        `;
      document.body.appendChild(tooltip);

      // Posicionar el tooltip cerca del mouse
      info.el.addEventListener("mousemove", (e) => {
        tooltip.style.left = e.pageX + 10 + "px";
        tooltip.style.top = e.pageY + 10 + "px";
      });
    },
    eventMouseLeave: function () {
      // Eliminar el tooltip al salir del evento
      const tooltips = document.querySelectorAll(".tooltip-event");
      tooltips.forEach((tooltip) => tooltip.remove());
    },
    eventClick: function (info) {
      // Abrir el modal de edición
      $("#editEventModal").modal("show");

      // Rellenar los campos del modal con los datos del evento seleccionado
      document.getElementById("editEventId").value = info.event.id; // ID del evento (oculto)
      document.getElementById("editEventDate").value = info.event.start
        .toISOString()
        .split("T")[0]; // Convertir fecha a formato YYYY-MM-DD
      document.getElementById("editEventType").value = info.event.title;
      document.getElementById("editEventRole").value = info.event.extendedProps.rol;
      document.getElementById("editEventDescription").value =
        info.event.extendedProps.description;
    },
  });

  calendar.render();
}



// Eventos de los botones 

// Agregar Evento
document.getElementById("addEventButton").addEventListener("click", () => {
  // Limpiar los campos del formulario
  document.getElementById("eventDate").value = selectedDate || ""; // Usar la fecha seleccionada o dejar vacío
  document.getElementById("eventType").value = ""; // Limpiar tipo de evento
  document.getElementById("eventRole").value = ""; // Limpiar ROL / Año
  document.getElementById("eventDescription").value = ""; // Limpiar descripción

  // Mostrar el modal de agregar evento
  $("#addEventModal").modal("show");
});

// Botón Guardar
document.getElementById("saveEventButton").addEventListener("click", async () => {
  const eventDate = document.getElementById("eventDate").value;
  const eventType = document.getElementById("eventType").value;
  const eventRole = document.getElementById("eventRole").value;
  const eventDescription = document.getElementById("eventDescription").value;

  if (!eventDate || !eventType || !eventRole) {
    alert("Por favor complete todos los campos obligatorios.");
    return;
  }

  const eventData = {
    fecha: eventDate, // Fecha del evento
    tipo: eventType, // Tipo de evento
    rol: eventRole, // ROL del evento
    descripcion: eventDescription, // Descripción del evento
  };

  try {
    await addEvent(eventData); // Llamar a la función para agregar evento
    $("#addEventModal").modal("hide"); // Cerrar el modal de agregar
    await loadEvents(); // Recargar los eventos
    console.log("Evento guardado con éxito:", eventData); // Registro de confirmación
  } catch (error) { // Manejar errores correctamente
    console.error("Error al guardar el evento:", error); // Mostrar error en la consola
    alert("No se pudo guardar el evento. Intente nuevamente.");
  }
});

// Botón Actualizar
document.getElementById("updateEventButton").addEventListener("click", async () => {
  const eventId = document.getElementById("editEventId").value; // Obtener el ID del evento
  const eventDate = document.getElementById("editEventDate").value;
  const eventType = document.getElementById("editEventType").value;
  const eventRole = document.getElementById("editEventRole").value;
  const eventDescription = document.getElementById("editEventDescription").value;

  if (!eventId || !eventDate || !eventType || !eventRole) {
    alert("Por favor complete todos los campos.");
    return;
  }

  const updatedData = {
    fecha: eventDate,
    tipo: eventType,
    rol: eventRole,
    descripcion: eventDescription,
  };

  await updateEvent(eventId, updatedData); // Llamar a la función de actualización
  $("#editEventModal").modal("hide"); // Cerrar el modal
});

// Botón Eliminar
document.getElementById("deleteEventButton").addEventListener("click", async () => {
  const eventId = document.getElementById("editEventId").value; // Obtener el ID del evento

  if (!eventId) {
    alert("No se ha seleccionado ningún evento para eliminar.");
    return;
  }

  await deleteEvent(eventId); // Llamar a la función de eliminación
  $("#editEventModal").modal("hide"); // Cerrar el modal
});


