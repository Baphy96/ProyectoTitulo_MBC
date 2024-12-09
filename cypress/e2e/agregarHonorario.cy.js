describe('Pruebas de agregar honorarios', () => {
    beforeEach(() => {
        cy.visit('http://localhost/gestion-judicial/html/gestionCausas.html', {
            onBeforeLoad(win) {
                win.localStorage.setItem('userRole', 'Administrador'); // Simula el rol de Administrador
            },
        });

        // Simula datos en la tabla
        cy.document().then((doc) => {
            const tableBody = doc.querySelector('#causasTable tbody');
            if (tableBody) {
                tableBody.innerHTML = `
                    <tr>
                        <td>258-2024</td>
                        <td>Soc. Comercial E Industrial Multihidraulica Flexocar Ltda.</td>
                        <td>
                            <button id="addCause" class="btn btn-primary mb-2">Agregar Nueva Causa</button>
                        </td>
                    </tr>
                `;
            }
        });
    });

    it('Debería abrir el formulario de agregar honorarios', () => {
        cy.get('#addCause').should('be.visible').click();
        cy.get('#addCauseModal').should('be.visible');

        // Llena el campo ROL
        cy.get('#rolCausa').type('258-2024');

        // Abre el modal de honorarios
        cy.get('#honorariosButton').scrollIntoView().should('be.visible').click();

        // Verifica que el modal de honorarios esté visible
        cy.get('#honorariosModal').should('be.visible');
    });


   it('Debería agregar honorarios a la causa', () => {
        cy.contains('td', '258-2024')
            .should('be.visible')
            .parent()
            .within(() => {
                cy.contains('Soc. Comercial E Industrial Multihidraulica Flexocar Ltda.').should('be.visible');
            });

        cy.get('#addCause').should('be.visible').click();
        cy.get('#rolCausa').type('258-2024');
        cy.get('#honorariosButton').scrollIntoView().should('be.visible').click();

        // Llena el formulario de honorarios
        cy.get('#rolHonorarios').should('have.value', '258-2024');
        cy.get('#tipoDocumento').select('Factura Electrónica');
        cy.get('#numeroDocumento').type('123456');
        cy.get('#fechaDocumento').type('2024-01-01');
        cy.get('#montoHonorarios').type('500000');

        // Captura cualquier mensaje de alerta
        cy.window().then((win) => {
            const stub = cy.stub(win, 'alert');
            cy.get('#honorariosForm').find('button[type="submit"]').click().then(() => {
                expect(stub).to.be.calledOnce;
                const alertText = stub.getCall(0).args[0];
                if (alertText.includes('Hubo un error al cargar las causas')) {
                    throw new Error('Error inesperado: ' + alertText);
                } else {
                    expect(alertText).to.include('Honorarios guardados temporalmente.');
                }
            });
        });
    });


    it('Debería mostrar un error si faltan campos obligatorios', () => {
        cy.get('#addCause').should('be.visible').click();
        cy.get('#rolCausa').type('258-2024');
        cy.get('#honorariosButton').scrollIntoView().should('be.visible').click();

        // Llena algunos campos y deja otros vacíos
        cy.get('#rolHonorarios').should('have.value', '258-2024');
        cy.get('#tipoDocumento').select('Factura Electrónica');

        // Intenta guardar sin completar todos los campos
        cy.get('#honorariosForm').find('button[type="submit"]').click();

        // Verifica el mensaje de error
        cy.on('window:alert', (text) => {
            expect(text).to.include('Por favor complete todos los campos obligatorios de honorarios.');
        });
    });
});