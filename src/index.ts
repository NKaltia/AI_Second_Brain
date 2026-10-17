import express from 'express';
import { config } from './config.js';
import apiRoutes from './routes/api.routes.js';

const app = express();

app.use(express.json());
app.use(express.static('public'));

// Use our central API router
app.use('/', apiRoutes);

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});
