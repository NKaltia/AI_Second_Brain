import express from 'express';
import { randomUUID } from 'node:crypto';
import { pinoHttp } from 'pino-http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { config } from './config.js';
import { logger } from './logger.js';
import apiRoutes from './routes/api.routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';

const app = express();

// Request ID + structured access logs (before routes so every request is correlated)
app.use(
    pinoHttp({
        logger,
        genReqId: (req: IncomingMessage, res: ServerResponse) => {
            const header = req.headers['x-request-id'];
            const fromClient = Array.isArray(header) ? header[0] : header;
            const id = fromClient && fromClient.length > 0 ? fromClient : randomUUID();
            res.setHeader('X-Request-Id', id);
            return id;
        },
        // Health checks would flood logs every few seconds on Render
        autoLogging: {
            ignore: (req: IncomingMessage) =>
                req.url === '/health' || (req.url?.startsWith('/health?') ?? false),
        },
    })
);

app.use(express.json({ limit: '100kb' }));
app.use(express.static('public'));

app.use('/', apiRoutes);

app.use(errorMiddleware);

app.listen(config.port, () => {
    logger.info({ port: config.port }, 'Server is running');
});
