const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html' || req.url === '/auth-test.html') {
    fs.readFile(path.join(__dirname, 'auth-test.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading auth-test.html');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('Press Ctrl+C to stop the server');
});
