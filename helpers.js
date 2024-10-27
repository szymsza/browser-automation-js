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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  send,
  sleep,
};