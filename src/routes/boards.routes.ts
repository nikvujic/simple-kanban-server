import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import {
  getBoardsController,
  createBoardController,
  updateBoardController,
  deleteBoardController,
} from '../modules/boards/board.controller.js';

const boardsRouter = Router();

boardsRouter.get('/boards', requireAuth, getBoardsController);
boardsRouter.post('/boards', requireAuth, createBoardController);
boardsRouter.patch('/boards/:id', requireAuth, updateBoardController);
boardsRouter.delete('/boards/:id', requireAuth, deleteBoardController);

export default boardsRouter;
