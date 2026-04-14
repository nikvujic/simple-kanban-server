import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import {
  getBoardsController,
  getBoardByIdController,
  createBoardController,
  updateBoardController,
  deleteBoardController,
  importDataController,
  reorderBoardsController,
} from '../modules/boards/board.controller.js';

const boardsRouter = Router();

boardsRouter.get('/boards', requireAuth, getBoardsController);
boardsRouter.post('/boards/import', requireAuth, importDataController);
boardsRouter.patch('/boards/reorder', requireAuth, reorderBoardsController);
boardsRouter.get('/boards/:id', requireAuth, getBoardByIdController);
boardsRouter.post('/boards', requireAuth, createBoardController);
boardsRouter.patch('/boards/:id', requireAuth, updateBoardController);
boardsRouter.delete('/boards/:id', requireAuth, deleteBoardController);

export default boardsRouter;
