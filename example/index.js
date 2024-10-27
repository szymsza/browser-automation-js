const Chromium = require('../browsers/chromium');

const browserId = 'XXX';  // TODO

(async () => {
  const browser = await Chromium.init(browserId);
  await browser.navigate('http://127.0.0.1:3000/');
  await browser.click(100, 100);
})();