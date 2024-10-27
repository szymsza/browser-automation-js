// brave --headless --no-sandbox --remote-debugging-port=9222
// firefox --headless --remote-debugging-port // TODO - (WebDriver BiDi)

const Chromium = require('./chromium');

const browserId = '5367f1eb-d67f-4c4a-b1cd-c46a6cb59574';
const navigateUrl = 'http://127.0.0.1:3000/';


(async () => {
  const browser = await Chromium(browserId);
  await browser.navigate(navigateUrl);
  await browser.click(100, 100);
})();