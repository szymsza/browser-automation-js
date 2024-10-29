// Official documentation: https://w3c.github.io/webdriver-bidi
// Getting started repo: https://github.com/webdriverio/webdriverio/tree/main/examples/bidi

const WebSocket = require('ws');
const { send, sleep, listen } = require('../helpers');
const Browser = require('./browser');

class Firefox extends Browser {
  browsingContext;
  static requestId = 0;

  async initializeConnection(_browserId, port, host) {
    this.wsEndpoint = `ws://${host}:${port}/session`;

    // Create a websocket to issue CDP commands.
    this.ws = new WebSocket(this.wsEndpoint, { perMessageDeflate: false });
    await new Promise(resolve => this.ws.once('open', resolve));

    // Initiate the session
    const sessionId = (await send(this.ws, {
      'method': 'session.new',
      'params': {
        'capabilities': {},
      },
      'id': Firefox.requestId++,
    })).result.sessionId;

    // Subscribe to browser events
    await send(this.ws, {
      id: Firefox.requestId++,
      method: 'session.subscribe',
      params: {
        events: [
          'browsingContext.domContentLoaded',
        ],
      },
    });

    // Create the browsing context
    const userContext = (await send(this.ws, {
      'method': 'browser.createUserContext',
      'params': {},
      'id': Firefox.requestId++,
    })).result.userContext;

    this.browsingContext = (await send(this.ws, {
      'method': 'browsingContext.create',
      'params': {
        'type': 'tab',
        userContext,
      },
      'id': Firefox.requestId++,
    })).result.context;
  }

  async closeConnection() {
    await send(this.ws, {
      'method': 'session.end',
      'params': {},
      'id': Firefox.requestId++,
    });
  }

  async navigate(url) {
    const { result: { navigation } } = await send(this.ws, {
      'method': 'browsingContext.navigate',
      'params': {
        context: this.browsingContext,
        url,
      },
      'id': Firefox.requestId++,
    });

    // Wait for the DOM to load
    await listen(this.ws, 'browsingContext.domContentLoaded', {
      url,
      context: this.browsingContext,
      navigation,
    });
  }

  async click(x, y) {
    await send(this.ws, {
      id: Firefox.requestId++,
      method: 'input.performActions',
      params: {
        context: this.browsingContext,
        actions: [
          {
            type: 'pointer',
            id: (Firefox.requestId++).toString(),
            actions: [ {
              type: 'pointerDown',
              button: 1,
              width: x,
              height: y,
            }, {
              type: 'pointerUp',
              button: 1,
              width: x,
              height: y,
            } ],
          },
        ],
      },
    });
  }
}

module.exports = Firefox;
