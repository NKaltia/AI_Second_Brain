import 'dotenv/config';
import express from 'express';
import apiRoutes from './routes/api.routes.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Use our central API router
app.use('/', apiRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
