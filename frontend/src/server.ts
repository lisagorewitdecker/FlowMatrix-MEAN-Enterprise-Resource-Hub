import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import http from 'node:http'; // 1. Import http

const browserDistFolder = join(import.meta.dirname, '../browser');
const app = express();
const angularApp = new AngularNodeAppEngine();

// 2. Forward all /api requests to the backend container
app.use('/api', (clientReq, clientRes) => {
  const backendHost = process.env['BACKEND_HOST'] || 'backend';
  const backendPort = process.env['BACKEND_PORT'] || 5000;

  const proxyReq = http.request(
    {
      hostname: backendHost,
      port: backendPort,
      path: clientReq.originalUrl,
      method: clientReq.method,
      headers: {
        ...clientReq.headers,
        host: `${backendHost}:${backendPort}`,
      },
    },
    (proxyRes) => {
      proxyRes.on('error', (err) => {
        console.error('API Proxy Response Error:', err);
        clientRes.destroy();
      });
      clientRes.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(clientRes, { end: true });
    }
  );

  proxyReq.on('error', (err) => {
    console.error('API Proxy Error:', err);
    if (!clientRes.headersSent) {
      clientRes.status(502).json({ message: 'Backend unreachable', error: err.message });
    }
  });

  clientReq.pipe(proxyReq, { end: true });
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4200;
  app.listen(port, (error) => {
    if (error) throw error;
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
