const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const PORT = process.env.PORT || 8080;
const DIST_DIR = path.join(__dirname, 'dist', 'NRSafe', 'browser');

// Proxy de API para backend HTTP, evitando mixed content
const TARGET = process.env.API_TARGET || 'http://54.162.50.188:8080';
app.use('/api', createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api'
  },
  secure: false
}));

// Conteúdo estático do Angular
app.use(express.static(DIST_DIR));

// Fallback para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Front em ${PORT}. Proxy de API -> ${TARGET}`);
});






