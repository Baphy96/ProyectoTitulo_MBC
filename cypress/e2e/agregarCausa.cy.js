describe('Pruebas de agregar causa', () => {
    beforeEach(() => {
        // Configurar el rol y visitar la página antes de cada prueba
        cy.visit('http://localhost/gestion-judicial/html/gestionCausas.html', {
            onBeforeLoad(win) {
                win.localStorage.setItem('userRole', 'Administrador'); // Ajusta el rol según sea necesario
            },
        });
    });

    it('Debería abrir el modal de agregar causa', () => {
        // Espera a que el botón "Agregar Causa" esté disponible y haz clic
        cy.get('#addCause', { timeout: 10000 }).should('be.visible').click();

        // Verifica que el modal esté visible
        cy.get('#addCauseModal').should('be.visible');
    });

    it('Debería resetear el formulario al abrir el modal', () => {
        // Abre el modal de agregar causa
        cy.get('#addCause', { timeout: 10000 }).should('be.visible').click();

        // Verifica que el atributo `data-id` esté ausente
        cy.get('#newCauseForm').should('not.have.attr', 'data-id');

        // Verifica que el campo "cliente" no esté deshabilitado
        cy.get('#cliente').should('not.be.disabled');

        // Verifica que los campos de entrada del formulario estén vacíos
        cy.get('#newCauseForm input').each(($input) => {
            cy.wrap($input).invoke('val').should('be.empty');
        });
    });
});
