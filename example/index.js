const Chromium = require('../browsers/chromium');
const Firefox = require('../browsers/firefox');

const browserId = 'XXX';  // TODO

(async () => {
  console.log('Starting up Chromium...');
  const chromium = await Chromium.init(browserId, 100, 9223);
  await chromium.navigate('http://127.0.0.1:3000/');
  await chromium.click(100, 100);

  console.log('Starting up Firefox...');
  const firefox = await Firefox.init();
  await firefox.navigate('http://127.0.0.1:3000');
  await firefox.click(100, 100);
})();