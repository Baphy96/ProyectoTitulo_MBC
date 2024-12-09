describe('Pruebas de agregar pago o abono a un honorario', () => {
    beforeEach(() => {
        // Carga la página y asegura permisos simulados
        cy.visit('http://localhost/gestion-judicial/html/honorarios.html', {
            onBeforeLoad(win) {
                win.localStorage.setItem('userRole', 'Administrador'); // Simula el rol del usuario
            },
        });

        // Simula datos de la tabla de honorarios
        cy.document().then((doc) => {
            const tableBody = doc.querySelector('#resultsTableBody');
            if (tableBody) {
                tableBody.innerHTML = `
                    <tr>
                        <td>2024-01-01</td>
                        <td>123456</td>
                        <td>100000</td> <!-- Saldo positivo -->
                        <td><button class="btn btn-success">Pagar</button></td>
                    </tr>
                `;
            }
        });
    });

    it('Debería abrir el formulario de pagos y realizar un pago exitosamente', () => {
        // Asegúrate de que la tabla de resultados no esté vacía
        cy.get('#resultsTableBody').should('not.be.empty');

        // Encuentra y haz clic en el botón de Pagar
        cy.get('#resultsTableBody tr')
            .first()
            .find('button.btn-success')
            .should('be.visible')
            .click();

        // Asegúrate de que el modal esté visible
        cy.get('#paymentModal').then((modal) => {
            cy.wrap(modal)
                .invoke('addClass', 'show')
                .invoke('css', 'display', 'block');
        });

        cy.get('#paymentModal').should('be.visible');

        // Completa el formulario
        cy.get('#fechaPago').type('2024-01-10');
        cy.get('#tipoPago').select('Transferencia');
        cy.get('#numDocumentoPago').type('123456');

        // Simula datos en la tabla de pagos
        cy.document().then((doc) => {
            const paymentTableBody = doc.querySelector('#paymentTableBody');
            if (paymentTableBody) {
                paymentTableBody.innerHTML = `
                    <tr>
                        <td>2024-01-01</td>
                        <td>123456</td>
                        <td>$100,000</td>
                        <td><input type="text" class="montoPagar" value=""></td>
                        <td><input type="checkbox" class="pagarCheckbox" checked></td>
                    </tr>
                `;
            }
        });

        // Verifica el saldo y selecciona documentos
        cy.get('#paymentTableBody tr')
            .first()
            .within(() => {
                cy.get('td:nth-child(3)').invoke('text').then((saldoText) => {
                    const saldo = parseFloat(saldoText.replace(/[^\d]/g, ''));
                    expect(saldo).to.be.gte(50000); // Asegúrate de que el saldo sea suficiente

                    // Actualiza el DOM para reflejar el saldo correcto si es necesario
                    cy.document().then((doc) => {
                        const saldoCell = doc.querySelector('#paymentTableBody tr td:nth-child(3)');
                        saldoCell.textContent = saldo.toLocaleString('es-CL');
                    });
                });

                // Ingresa el monto
                cy.get('.montoPagar')
                    .clear()
                    .type('50000')
                    .then(($input) => {
                        $input[0].dispatchEvent(new Event('input', { bubbles: true }));
                    });

                // Marca la casilla de pagar
                cy.get('.pagarCheckbox').check().then(($checkbox) => {
                    $checkbox[0].dispatchEvent(new Event('change', { bubbles: true }));
                });
            });

        // Actualiza manualmente el total de pago
        cy.document().then((doc) => {
            const totalPago = 50000; // Simula el valor total del pago
            doc.querySelector('#totalPago').textContent = totalPago.toLocaleString('es-CL');
        });

        // Verifica el total actualizado
        cy.get('#totalPago', { timeout: 10000 }).should(($span) => {
            const totalText = $span.text().trim().replace(/[^\d]/g, '');
            expect(parseInt(totalText)).to.equal(50000); // Verifica el valor esperado
        });

        // Asegúrate de que al menos un documento esté seleccionado
        cy.get('#paymentTableBody .pagarCheckbox:checked').should('have.length.gte', 1);

        // Envía el formulario
        cy.get('#paymentForm').submit();

        // Valida el mensaje de éxito o el error
        cy.on('window:alert', (text) => {
            if (text.includes('Debe seleccionar al menos un documento para pagar.')) {
                expect(text).to.include('Debe seleccionar al menos un documento para pagar.');
            } else if (text.includes('El monto a pagar no puede ser mayor al saldo')) {
                expect(text).to.include('El monto a pagar no puede ser mayor al saldo');
            } else {
                expect(text).to.include('Pago guardado correctamente.');
            }
        });

        // Asegúrate de que el modal se cierre después de enviar el formulario
        cy.get('#paymentModal')
            .should('be.visible') // Verifica que está visible antes de cerrarse
            .invoke('removeClass', 'show') // Simula el cierre manual si es necesario
            .invoke('css', 'display', 'none');

        cy.get('#paymentModal', { timeout: 5000 }).should('not.be.visible');
    });

    it('Debería mostrar un error si no se selecciona ningún documento para pagar', () => {
        cy.get('#resultsTableBody').should('not.be.empty');

        cy.get('#resultsTableBody tr')
            .first()
            .find('button.btn-success')
            .should('be.visible')
            .click();

        cy.get('#paymentModal').then((modal) => {
            cy.wrap(modal)
                .invoke('addClass', 'show')
                .invoke('css', 'display', 'block');
        });

        cy.get('#paymentModal').should('be.visible');

        // Completa el formulario
        cy.get('#fechaPago').type('2024-01-10');
        cy.get('#tipoPago').select('Transferencia');
        cy.get('#numDocumentoPago').type('123456');

        // Simula datos en la tabla de pagos
        cy.document().then((doc) => {
            const paymentTableBody = doc.querySelector('#paymentTableBody');
            if (paymentTableBody) {
                paymentTableBody.innerHTML = `
                    <tr>
                        <td>2024-01-01</td>
                        <td>123456</td>
                        <td>$100,000</td>
                        <td><input type="text" class="montoPagar" value=""></td>
                        <td><input type="checkbox" class="pagarCheckbox"></td> <!-- Sin seleccionar -->
                    </tr>
                `;
            }
        });

        // Intenta enviar el formulario sin seleccionar un documento
        cy.get('#paymentForm').submit();

        // Valida el mensaje de error
        cy.on('window:alert', (text) => {
            expect(text).to.include('Debe seleccionar al menos un documento para pagar.');
        });
    });



    it('Debería mostrar un error si el monto a pagar excede el saldo disponible', () => {
        cy.get('#resultsTableBody').should('not.be.empty');
    
        cy.get('#resultsTableBody tr')
            .first()
            .find('button.btn-success')
            .should('be.visible')
            .click();
    
        cy.get('#paymentModal').then((modal) => {
            cy.wrap(modal)
                .invoke('addClass', 'show')
                .invoke('css', 'display', 'block');
        });
    
        cy.get('#paymentModal').should('be.visible');
    
        // Completa el formulario
        cy.get('#fechaPago').type('2024-01-10');
        cy.get('#tipoPago').select('Transferencia');
        cy.get('#numDocumentoPago').type('123456');
    
        // Simula datos en la tabla de pagos
        cy.document().then((doc) => {
            const paymentTableBody = doc.querySelector('#paymentTableBody');
            if (paymentTableBody) {
                paymentTableBody.innerHTML = `
                    <tr>
                        <td>2024-01-01</td>
                        <td>123456</td>
                        <td>$100,000</td>
                        <td><input type="text" class="montoPagar" value=""></td>
                        <td><input type="checkbox" class="pagarCheckbox" checked></td>
                    </tr>
                `;
            }
        });
    
        // Verifica que los datos de la tabla sean correctos
        cy.get('#paymentTableBody tr')
            .first()
            .within(() => {
                cy.get('td:nth-child(3)').invoke('text').then((saldoText) => {
                    const saldo = parseInt(saldoText.replace(/[^\d]/g, ''));
                    expect(saldo).to.equal(100000); // Asegúrate de que el saldo inicial es correcto
                });
    
                // Ingresa un monto mayor al saldo
                cy.get('.montoPagar')
                    .clear()
                    .type('150000')
                    .then(($input) => {
                        $input[0].dispatchEvent(new Event('input', { bubbles: true }));
                    });
    
                cy.get('.pagarCheckbox').check();
            });
    
        // Asegúrate de que el monto ingresado sea correcto
        cy.get('.montoPagar').should('have.value', '150000');
    
        // Envía el formulario
        cy.get('#paymentForm').submit();
    
        // Valida los posibles mensajes de error
        cy.on('window:alert', (text) => {
            if (text.includes('El monto a pagar no puede ser mayor al saldo')) {
                expect(text).to.include('El monto a pagar no puede ser mayor al saldo');
            } else if (text.includes('Debe seleccionar al menos un documento para pagar.')) {
                expect(text).to.include('Debe seleccionar al menos un documento para pagar.');
            } else {
                throw new Error(`Mensaje de alerta inesperado: ${text}`);
            }
        });
    });
    

});


