import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.routes.js';
import meRouter from './routes/me.route.js';
import boardsRouter from './routes/boards.routes.js';
import listsRouter from './routes/lists.routes.js';
import cardsRouter from './routes/cards.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true, message: 'Server is running' });
});

app.use('/api/auth', authRouter);
app.use('/api', meRouter);
app.use('/api', boardsRouter);
app.use('/api', listsRouter);
app.use('/api', cardsRouter);

export default app;