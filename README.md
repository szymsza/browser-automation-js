# Browser Automation JS

This package allows you to programmatically communicate with browsers using WebSockets - e.g., automatically navigate to a webpage and click a button. WebDriver BiDi is used for Firefox, Chrome DevTools Protocol for Chromium.

The purpose of this package is to allow browser automation for all browser verisons that support CDP or WebDriver BiDi. This is primarily useful to compare browser features adoption or vulnerabilities exploits across different browser versions. If you want to test your website in the latest browsers, you will be much better off with frameworks such as [Selenium](https://www.selenium.dev/), [Playwright](https://playwright.dev/), [Puppeteer](https://pptr.dev/) etc.

## Usage

Run `npm install` to install dependencies.

## Example
Run `npm run serve` and keep the server up.

Start a Chromium instance, e.g., by running `brave --headless --no-sandbox --remote-debugging-port=9222`. You will be presented with a message like `DevTools listening on ws://127.0.0.1:9222/devtools/browser/XXX`. Copy the browser id XXX and insert it into `examples/index.js`, constant `browserId`.

Run `npm run test`. You should see a message *'Link clicked!'* in the **server** console. This means that the test script in `examples/index.js` successfully connected to your browser, opened the page server by `examples/server.js`, and clicked the button on the page.
