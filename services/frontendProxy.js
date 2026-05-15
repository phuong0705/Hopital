const http = require('http');
const https = require('https');

const frontendOrigin = process.env.REPORTS_FRONTEND_INTERNAL_URL || 'http://localhost:3011';

function proxyToReportsFrontend(req, res, next) {
  const target = new URL(req.originalUrl, frontendOrigin);
  const client = target.protocol === 'https:' ? https : http;

  const proxyReq = client.request(
    target,
    {
      method: req.method,
      headers: {
        ...req.headers,
        host: target.host
      }
    },
    (proxyRes) => {
      res.status(proxyRes.statusCode || 502);

      for (const [key, value] of Object.entries(proxyRes.headers)) {
        if (value !== undefined) {
          res.setHeader(key, value);
        }
      }

      proxyRes.pipe(res);
    }
  );

  proxyReq.on('error', (error) => {
    if (res.headersSent) return res.end();
    error.message = `Khong ket noi duoc frontend bao cao tai ${frontendOrigin}. ${error.message}`;
    return next(error);
  });

  if (req.readable) {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
}

module.exports = {
  proxyToReportsFrontend
};
