import { config } from './config.js';
import { logger } from './logger.js';
import { createApp } from './app.js';

const app = createApp();

app.listen(config.port, () => {
    logger.info({ port: config.port }, 'Server is running');
});
