/// <reference types="cypress" />
/// <reference types="../support" />

import { faker } from '@faker-js/faker';

import SettingsPageObject from '../support/pages/settings.pageObject';
import HomePageObject from '../support/pages/home.pageObject';

const settingsPage = new SettingsPageObject();
const homePage = new HomePageObject();

describe('Settings page', () => {
  let user;
   before(() => {
    cy.task('db:clear');
  });

  beforeEach(() => {
    cy.task('generateUser').then((generatedUser) => {
      user = generatedUser;
      cy.register(user.email, user.username, user.password);
      cy.visit('/');
      cy.login(user.email, user.password);
      settingsPage.visit();
    });
  });

  it('should provide an ability to update username', () => {
    const timestamp = Date.now();
    const newUsername = `user${timestamp}`.toLowerCase();

    settingsPage.usernameInput.should('have.value', user.username);

    settingsPage.clearAndTypeUsername(newUsername);
    settingsPage.clickUpdateSettingsBtn();

    cy.url().should('include', `/profile/${newUsername}`);
    homePage.usernameLink.should('contain', newUsername);
  }); 

  it('should provide an ability to update bio', () => {
     const newBio = faker.lorem.sentence();

    settingsPage.clearAndTypeBio(newBio);
    settingsPage.clickUpdateSettingsBtn();

    cy.url().should('include', `/profile/${user.username}`);

    settingsPage.visit();
    settingsPage.assertBioValue(newBio);
  });

  it('should provide an ability to update an email', () => {
     const timestamp = Date.now();
    const newEmail = `test${timestamp}@mail.com`;

    settingsPage.clearAndTypeEmail(newEmail);
    settingsPage.clickUpdateSettingsBtn();

    cy.url().should('include', `/profile/${user.username}`);

    settingsPage.visit();
    settingsPage.assertEmailValue(newEmail);
  });

  it('should provide an ability to update password', () => {
     const timestamp = Date.now();
    const newPassword = `NewPass${timestamp}!`;

    settingsPage.clearAndTypePassword(newPassword);
    settingsPage.clickUpdateSettingsBtn();

    cy.url().should('include', `/profile/${user.username}`);

    settingsPage.visit();
    settingsPage.clickLogoutBtn();
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    cy.visit('/');
    cy.login(user.email, newPassword);
    settingsPage.visit();
    cy.url().should('include', '/settings');
  });

  it('should provide an ability to log out', () => { 
     settingsPage.clickLogoutBtn();

    cy.url().should('eq', Cypress.config().baseUrl + '/');

    cy.window().then((win) => {
      const userInStorage = win.localStorage.getItem('user');
      expect(userInStorage).to.be.null;
    });
  });
});
