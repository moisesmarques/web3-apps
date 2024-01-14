export default describe('Sign up Page', () => {
  it('Fetcing Signup Page', () => {
    cy.visit('http://localhost:3000/signup');
  });
  it('Filling Signup form', () => {
    cy.get('input[id="phone"]').type('2356659421').should('have.value', '+1 (235) 665-9421');
  });
  it('Submitting Signup form', () => {
    cy.get('button[type="submit"]').contains('Continue').click();
  });
  it('Filling Create an NFT account form', () => {
    cy.get('input[name="fullName"]').type('John').should('have.value', 'John');
  });
  it('Submitting Create an NFT account form', () => {
    cy.get('button[type="submit"]').contains('Continue');
  });
});
