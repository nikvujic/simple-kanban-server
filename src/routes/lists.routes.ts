import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import {
  createListController,
  updateListController,
  deleteListController,
} from '../modules/lists/list.controller.js';

const listsRouter = Router();

listsRouter.post('/boards/:boardId/lists', requireAuth, createListController);
listsRouter.patch('/boards/:boardId/lists/:id', requireAuth, updateListController);
listsRouter.delete('/boards/:boardId/lists/:id', requireAuth, deleteListController);

export default listsRouter;
