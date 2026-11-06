// Entry point for Hostinger's Node.js App hosting (Passenger), which requires a real .js
// startup file rather than an npm script — this wraps Next's own production server so
// Passenger has something to require() directly.
const { createServer } = require('http');
const next = require('next');

const port = process.env.PORT || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`Admin app ready on port ${port}`);
  });
});
