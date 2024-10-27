const { createServer } = require('node:http');
const hostname = '127.0.0.1';
const port = 3000;

const server = createServer((req, res) => {
  if (req.url === '/redirected') {
    console.log('Link clicked!');
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end(`<a href="http://${hostname}:${port}/redirected" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: red;">CLICK</a>`);
});
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});