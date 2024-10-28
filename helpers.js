const send = (ws, command) => new Promise(resolve => {
  ws.send(JSON.stringify(command));
  ws.on('message', function (text) {
    const response = JSON.parse(text);
    if (response.id === command.id) {
      ws.removeListener('message', arguments.callee);
      resolve(response);
    }
  });
});

const listen = (ws, event, params = {}) => new Promise(resolve => {
  ws.on('message', function(text) {
    const response = JSON.parse(text);
    const responseParams = response?.params;

    for (const [key, value] of Object.entries(params)) {
      // Equal values, up to trailing slashes
      if (responseParams?.[key].replace(/\/?$/, '/') !== value.replace(/\/?$/, '/')) {
        return;
      }
    }

    if (response?.type === 'event' && response?.method === event) {
      ws.removeListener('message', arguments.callee);
      resolve(response);
    }
  });
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  send,
  listen,
  sleep,
};