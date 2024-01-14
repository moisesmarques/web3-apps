export default describe('Authentcate Page', () => {
  it('Fetcing Authentcate Page', () => {
    cy.visit('http://localhost:3000/authenticate');
  });
  it('Filling Verification form', () => {
    cy.get('input[name="otp-0"]').type('3').should('have.value', '3');
    cy.get('input[name="otp-1"]').type('5').should('have.value', '5');
    cy.get('input[name="otp-2"]').type('9').should('have.value', '9');
    cy.get('input[name="otp-3"]').type('7').should('have.value', '7');
    cy.get('input[name="otp-4"]').type('6').should('have.value', '6');
    cy.get('input[name="otp-5"]').type('8').should('have.value', '8');
  });
  it('Submitting Verification form', () => {
    cy.get('button[type="submit"]').contains('Continue').click();
  });
});
