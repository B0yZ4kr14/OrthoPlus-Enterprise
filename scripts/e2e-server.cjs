const express = require('express');
const path = require('path');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 8080;
const DIST_DIR = path.join(__dirname, '../apps/web/dist');
const API_TARGET = process.env.API_URL || 'http://localhost:3005';

const apiUrl = new URL(API_TARGET);

function createProxyHandler() {
  return (req, res) => {
    const options = {
      hostname: apiUrl.hostname,
      port: apiUrl.port,
      path: req.originalUrl,
      method: req.method,
      headers: {
        ...req.headers,
        host: apiUrl.host,
      },
    };

    const proxy = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxy.on('error', (err) => {
      console.error('[e2e-server] Proxy error:', err.message);
      if (!res.headersSent) {
        res.status(502).json({ error: 'Backend unavailable', message: err.message });
      }
    });

    req.pipe(proxy, { end: true });
  };
}

app.use('/api', createProxyHandler());
app.use('/rest', createProxyHandler());

app.use(express.static(DIST_DIR));

app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`E2E server running on http://localhost:${PORT}`);
  console.log(`Proxying /api and /rest to ${API_TARGET}`);
});
