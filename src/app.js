import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';

import usuarioCategoriaRouter from './routes/categoriaUsuario/categoriaUsuario.route.js';
import homeRouter from './routes/home.route.js';
import conteudoRouter from './routes/conteudo/conteudo.route.js';
import usuarioRouter from './routes/usuario/usuario.route.js';
import avaliacoesRouter from './routes/avaliacao/avaliacao.route.js';
import assistenteRouter from './routes/assistente/assistente.route.js';

const app = express();
app.use(cors());

app.use(bodyParser.json());
app.use('/api', homeRouter);
app.use('/api', conteudoRouter);
app.use('/api', usuarioCategoriaRouter);
app.use('/api', usuarioRouter);
app.use('/api', avaliacoesRouter);
app.use('/api', assistenteRouter);

export default app;
