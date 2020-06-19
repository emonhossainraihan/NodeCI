class Page {
  goto() {
    console.log('another page');
  }
  setCookie() {
    console.log('setting cookie');
  }
}
//! here we use proxy to add functionality
//! without modifying the underlying page class
class CustomPage {
  static build() {
    const page = new Page();
    const customPage = new CustomPage(page);

    const superPage = new Proxy(customPage, {
      get: function (target, property) {
        return target[property] || page[property];
      },
    });
    return superPage;
  }
  constructor(page) {
    this.page = page;
  }
  superGoto() {
    console.log('localhost:3000');
  }
  login() {
    this.superGoto();
    this.page.setCookie();
  }
}

const superPage = CustomPage.build();
superPage.goto();
superPage.login();
