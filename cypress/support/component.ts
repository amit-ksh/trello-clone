// ***********************************************************

// Import commands.js using ES2015 syntax:

// Alternatively you can use CommonJS syntax:
// require('./commands')

import "../../src/common";
import { mount } from "cypress/vue";

Cypress.Commands.add("mount", mount);
