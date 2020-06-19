const Page = require('./helpers/page');

const mongoose = require('mongoose');

let page;
//! declare globally unless they are scoped inside the function
beforeEach(async () => {
  //* we already implement (browser & page) in CustomPage

  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('close mongoose database after creating fake user', () => {
  afterAll(async (done) => {
    //! Closing the DB connection allows Jest to exit successfully.
    await mongoose.connection.close();
    done();
  });
});

//! every single operation in puppeteer is async
test('the header has the corrent text', async () => {
  const text = await page.$eval('a.brand-logo', (element) => element.innerHTML);
  expect(text).toEqual('Blogster');
});

test('clicking login starts oauth flow', async () => {
  await page.waitFor('.right a');
  await page.click('.right a');
  const url = await page.url(); //! get the url which popup after clicking the Login button
  expect(url).toMatch(/accounts\.google\.com/); //* use ReEx
});

test('when signed in, shows logout button', async () => {
  await page.login();
  const text = await page.$eval('a[href="/auth/logout"]', (el) => el.innerHTML);
  expect(text).toEqual('Logout');
});
