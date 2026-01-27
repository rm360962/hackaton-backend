import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';

import usuarioCategoriaRouter from './routes/categoriaUsuario/categoriaUsuario.route.js';
import homeRouter from './routes/home.route.js';
import usuarioRouter from './routes/usuario/usuario.route.js';


const app = express();
app.use(cors());

app.use(bodyParser.json());
app.use('/api', homeRouter);
app.use('/api', usuarioCategoriaRouter);
app.use('/api', usuarioRouter);

export default app;
