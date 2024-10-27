// Official documentation: https://chromedevtools.github.io/devtools-protocol/tot/Input/#method-dispatchMouseEvent
// Better documentation: https://vanilla.aslushnikov.com/?Input.dispatchKeyEvent
// Getting started repo: https://github.com/aslushnikov/getting-started-with-cdp/blob/master/README.md

const WebSocket = require('ws');
const { send, sleep } = require('../helpers');
const Browser = require('./browser');

class Chromium extends Browser {
  sessionId;
  static requestId = 0;

  async initializeConnection(browserId, port, host) {
    this.beforeAction();

    this.wsEndpoint = `ws://${host}:${port}/devtools/browser/${browserId}`;

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

    this.afterAction();
  }

  async navigate(url) {
    this.beforeAction();

    await send(this.ws, {
      sessionId: this.sessionId,
      id: Chromium.requestId++, // Note that IDs are independent between sessions.
      method: 'Page.navigate',
      params: {
        url: url,
      },
    });

    await sleep(10);

    this.afterAction();
  }

  async click(x, y) {
    this.beforeAction();

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

    this.afterAction()
  }
}

module.exports = Chromium;