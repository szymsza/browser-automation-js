const Chromium = require('../browsers/chromium');

const browserId = '5367f1eb-d67f-4c4a-b1cd-c46a6cb59574';  // TODO

(async () => {
  const browser = await Chromium.init(browserId);
  await browser.navigate('http://127.0.0.1:3000/');
  await browser.click(100, 100);
})();