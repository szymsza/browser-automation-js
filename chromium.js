// Official documentation: https://chromedevtools.github.io/devtools-protocol/tot/Input/#method-dispatchMouseEvent
// Better documentation: https://vanilla.aslushnikov.com/?Input.dispatchKeyEvent
// Getting started repo: https://github.com/aslushnikov/getting-started-with-cdp/blob/master/README.md

const WebSocket = require('ws');
const { send, sleep } = require('./helpers');

const Browser = async (browserId, autocloseTimeout = 100) => {
  const endpoint = `ws://127.0.0.1:9222/devtools/browser/${browserId}`;

  // Create a websocket to issue CDP commands.
  const ws = new WebSocket(endpoint, { perMessageDeflate: false });
  await new Promise(resolve => ws.once('open', resolve));

  // Get list of all targets and find a "page" target.
  const targetsResponse = await send(ws, {
    id: 1,
    method: 'Target.getTargets',
  });
  const pageTarget = targetsResponse.result.targetInfos.find(info => info.type === 'page');

  // Attach to the page target.
  const sessionId = (await send(ws, {
    id: 2,
    method: 'Target.attachToTarget',
    params: {
      targetId: pageTarget.targetId,
      flatten: true,
    },
  })).result.sessionId;

  // Auto close the socket when not sending any commands
  let wsAutocloseTimeout = null;
  const setAutocloseTimeout = () => {
    wsAutocloseTimeout = setTimeout(() => ws.close(), autocloseTimeout);
  }

  setAutocloseTimeout();
  return {
    navigate: async (url) => {
      clearTimeout(wsAutocloseTimeout);
      await send(ws, {
        sessionId,
        id: 1, // Note that IDs are independent between sessions.
        method: 'Page.navigate',
        params: {
          url: url,
        },
      });

      await sleep(10);
      setAutocloseTimeout();
    },
    click: async (x, y) => {
      clearTimeout(wsAutocloseTimeout);
      await send(ws, {
        sessionId,
        id: 2,
        method: 'Input.dispatchMouseEvent',
        params: {
          x,
          y,
          type: 'mousePressed',
          clickCount: 1,
          button: 'left',
        },
      });

      await send(ws, {
        sessionId,
        id: 3,
        method: 'Input.dispatchMouseEvent',
        params: {
          x,
          y,
          type: 'mouseReleased',
          button: 'left',
        },
      });
      setAutocloseTimeout();
    },
    close: () => {
      clearTimeout(wsAutocloseTimeout);
      ws.close()
    },
  };
};

module.exports = Browser;