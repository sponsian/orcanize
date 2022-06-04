import { injectWeb3 } from '../util';

context('Coordinape', () => {
  before(() => {
    const providerPort = Cypress.env('HARDHAT_GANACHE_PORT');
    Cypress.on('window:before:load', injectWeb3(providerPort));
    cy.mintErc20('USDC', '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', '20000');
  });
  after(() => {
    // might want something more surgical and lightweight
    // to facilitate faster idempotent testing
    // cy.exec('yarn db-seed-fresh');
  });
  it('can deploy a vault and create a distribution', () => {
    cy.visit('/circles');
    cy.login().wait(3000);
    // This is highly dependent upon how our seed is constructed..
    // Sports is a circle w/ an ended epoch, the Vaults button is a child of a peer element
    cy.contains('Sports', { timeout: 120000 }).click().wait(20000);
    cy.contains('Sports', { timeout: 120000 }).click();
    cy.contains('Vaults', { timeout: 120000 }).click();
    // Create a vault where none exist
    cy.contains('There are no vaults in your organization yet.', {
      timeout: 90000,
    });
    cy.contains('Add Vault').click();
    cy.contains('USDC').click();
    cy.contains('Create Vault').click();
    cy.contains('USDC Vault', { timeout: 120000 });
    // Deposit USDC into the vault
    cy.contains('Deposit').click();
    cy.get('input[type=number]').click().wait(1000).type('5000');
    cy.contains('button', 'Deposit USDC').click();
    cy.contains('Transaction completed');
    cy.contains('Transaction completed');
    cy.contains('5000 USDC');
    // submit distribution onchain
    cy.visit('/admin/circles');
    cy.contains('a', 'Distributions', { timeout: 120000 }).click();
    cy.get('input[type=number]').click().type('4500').wait(10000);
    cy.contains('button', 'Submit Distribution').click();
    cy.contains('Submitting', { timeout: 120000 });
    cy.contains('Please sign the transaction', { timeout: 120000 });
    cy.contains('Transaction completed', { timeout: 120000 });
    cy.contains('Distribution saved successfully', { timeout: 120000 });
    // This takes extremely long time to render in the UI without a refresh
    cy.reload(true);
    cy.contains('Distribution submitted today', { timeout: 120000 });
  });
});