export default describe('Login Page', () => {
  it('Fetching Login Page', () => {
    cy.visit('http://localhost:3000/login');
  });
  it('Filling Login form', () => {
    cy.get('input[id="accountId"]').type('testnearaccount').should('have.value', 'testnearaccount');
  });
  it('Submitting Login', () => {
    cy.get('button[type="submit"]').contains('Allow').click();
  });
});
