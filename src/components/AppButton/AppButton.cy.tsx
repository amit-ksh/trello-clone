import AppButton from "./index.vue";

describe("AppButton.cy.ts", () => {
  it("renders an app button", () => {
    cy.mount(() => <AppButton>Hello World!</AppButton>)
      .get("button")
      .click();
  });
});
