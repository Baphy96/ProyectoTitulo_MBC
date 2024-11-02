// Importar la configuración e inicialización de Firebase desde el archivo existente
import { app } from "../scripts/firebaseConfig.js";
import { getFirestore, collection, getDocs, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js";

// Obtener la instancia de Firestore
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', function () {
    const searchForm = document.getElementById('searchForm');
    const resultsTableBody = document.getElementById('resultsTableBody');
    const paymentModal = document.getElementById('paymentModal');
    const closeModal = document.querySelector('.close');
    const rutClientePago = document.getElementById('rutClientePago');
    const nombreClientePago = document.getElementById('nombreClientePago');
    const paymentForm = document.getElementById('paymentForm');

    // Manejar el formulario de búsqueda
    searchForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Obtener los valores de los filtros
        const periodoDesde = document.getElementById('periodoDesde').value;
        const periodoHasta = document.getElementById('periodoHasta').value;
        const rut = document.getElementById('rut').value;

        // Construir la consulta para obtener honorarios desde Firestore
        let honorariosQuery = collection(db, "honorarios");
        const conditions = [];

        if (periodoDesde) conditions.push(where("fecha", ">=", periodoDesde));
        if (periodoHasta) conditions.push(where("fecha", "<=", periodoHasta));
        if (rut) conditions.push(where("rutCliente", "==", rut));

        if (conditions.length > 0) {
            honorariosQuery = query(honorariosQuery, ...conditions);
        }

        try {
            const querySnapshot = await getDocs(honorariosQuery);
            const results = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                data.id = doc.id; // Añadir el ID del documento
                results.push(data);
            });

            // Llenar la tabla con los resultados obtenidos
            populateTable(results);
        } catch (error) {
            console.error("Error al obtener los honorarios: ", error);
        }
    });

    // Función para llenar la tabla de resultados
    function populateTable(results) {
        resultsTableBody.innerHTML = ''; // Limpiar tabla

        let currentClient = null;
        let clientTotal = 0;

        results.forEach((result, index) => {
            if (currentClient && currentClient !== result.rutCliente) {
                addClientTotalRow(currentClient, clientTotal);
                clientTotal = 0;
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${result.rutCliente}</td>
                <td>${result.nombreCliente}</td>
                <td>${result.rol}</td>
                <td>${result.tipoDocumento}</td>
                <td>${result.numeroDocumento}</td>
                <td>${result.fecha}</td>
                <td>${formatCurrency(result.monto)}</td>
                <td>${formatCurrency(result.abono)}</td>
                <td>${formatCurrency(result.saldo)}</td>
                <td><button class="pay-button" data-index="${index}">Pagar</button></td>
            `;
            resultsTableBody.appendChild(row);
            clientTotal += parseFloat(result.saldo);

            // Actualizar el cliente actual
            currentClient = result.rutCliente;

            // Asignar evento de pago al botón
            row.querySelector('.pay-button').addEventListener('click', () => {
                openPaymentModal(result);
            });
        });

        // Añadir la última fila de resumen
        if (currentClient) {
            addClientTotalRow(currentClient, clientTotal);
        }
    }

    // Añadir fila resumen para cada cliente
    function addClientTotalRow(rutCliente, total) {
        const totalRow = document.createElement('tr');
        totalRow.classList.add('client-total-row');
        totalRow.innerHTML = `
            <td colspan="8">Total para ${rutCliente}:</td>
            <td>${formatCurrency(total)}</td>
            <td></td>
        `;
        resultsTableBody.appendChild(totalRow);
    }

    // Función para abrir el modal de pago
    function openPaymentModal(result) {
        rutClientePago.value = result.rutCliente;
        nombreClientePago.value = result.nombreCliente;
        paymentModal.style.display = "block";
    }

    // Cerrar el modal de pago
    closeModal.addEventListener('click', () => {
        paymentModal.style.display = "none";
    });

    // Manejar el formulario de pago
    paymentForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const montoPagar = parseFloat(document.getElementById('montoPagar').value);
        const rutCliente = rutClientePago.value;

        try {
            // Aquí deberías actualizar el documento correspondiente en Firestore
            // Puedes buscar el documento del cliente y actualizar el saldo
            console.log(`Realizando pago de ${montoPagar} para ${rutCliente}`);

            // Implementar lógica de actualización aquí...

            // Cerrar el modal después del pago
            paymentModal.style.display = "none";
        } catch (error) {
            console.error("Error al realizar el pago: ", error);
        }
    });

    // Función para formatear valores monetarios
    function formatCurrency(value) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(value);
    }
});
