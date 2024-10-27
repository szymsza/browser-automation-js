// Official documentation: https://chromedevtools.github.io/devtools-protocol/tot/Input/#method-dispatchMouseEvent
// Better documentation: https://vanilla.aslushnikov.com/?Input.dispatchKeyEvent
// Getting started repo: https://github.com/aslushnikov/getting-started-with-cdp/blob/master/README.md

const WebSocket = require('ws');
const { send, sleep } = require('./helpers');

class Chromium {

  wsAutocloseDelay;
  wsAutocloseTimeout = null;

  wsEndpoint;
  ws;
  sessionId;
  static requestId = 0;

  constructor(staticInitUsed = false) {
    if (staticInitUsed !== true) {
      throw new Error('Do not instantiate this class by using the constructor. Instead, use the static async `init` method like `const browser = await Browser.init(...)`.');
    }
  }

  // Constructors cannot be async
  static async init(browserId, autocloseTimeout = 100, port = 9222, host = '127.0.0.1') {
    const c = new Chromium(true);
    c.wsEndpoint = `ws://${host}:${port}/devtools/browser/${browserId}`;
    c.wsAutocloseDelay = autocloseTimeout;
    await c.#initializeConnection();
    return c;
  }

  setAutocloseTimeout() {
    // Auto close the socket when not sending any commands
    this.wsAutocloseTimeout = setTimeout(() => this.ws.close(), this.wsAutocloseDelay);
  }

  async #initializeConnection() {
    // Create a websocket to issue CDP commands.
    this.ws = new WebSocket(this.wsEndpoint, { perMessageDeflate: false });
    await new Promise(resolve => this.ws.once('open', resolve));

    // Get list of all targets and find a "page" target.
    const targetsResponse = await send(this.ws, {
      id: Chromium.requestId++,
      method: 'Target.getTargets',
    });
    const pageTarget = targetsResponse.result.targetInfos.find(info => info.type === 'page');

    // Attach to the page target.
    this.sessionId = (await send(this.ws, {
      id: Chromium.requestId++,
      method: 'Target.attachToTarget',
      params: {
        targetId: pageTarget.targetId,
        flatten: true,
      },
    })).result.sessionId;

    this.setAutocloseTimeout();
  }

  async navigate(url) {
    clearTimeout(this.wsAutocloseTimeout);

    await send(this.ws, {
      sessionId: this.sessionId,
      id: Chromium.requestId++, // Note that IDs are independent between sessions.
      method: 'Page.navigate',
      params: {
        url: url,
      },
    });

    await sleep(10);

    this.setAutocloseTimeout();
  }

  async click(x, y) {
    clearTimeout(this.wsAutocloseTimeout);

    await send(this.ws, {
      sessionId: this.sessionId,
      id: Chromium.requestId++,
      method: 'Input.dispatchMouseEvent',
      params: {
        x,
        y,
        type: 'mousePressed',
        clickCount: 1,
        button: 'left',
      },
    });

    await send(this.ws, {
      sessionId: this.sessionId,
      id: Chromium.requestId++,
      method: 'Input.dispatchMouseEvent',
      params: {
        x,
        y,
        type: 'mouseReleased',
        button: 'left',
      },
    });

    this.setAutocloseTimeout();
  }

  close() {
    clearTimeout(this.wsAutocloseTimeout);
    this.ws.close();
  }
}

module.exports = Chromium;