import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import {
  createCardController,
  updateCardController,
  deleteCardController,
  moveCardController,
} from '../modules/cards/card.controller.js';

const cardsRouter = Router();

cardsRouter.post('/boards/:boardId/lists/:listId/cards', requireAuth, createCardController);
cardsRouter.patch('/boards/:boardId/cards/:id/move', requireAuth, moveCardController);
cardsRouter.patch('/boards/:boardId/cards/:id', requireAuth, updateCardController);
cardsRouter.delete('/boards/:boardId/cards/:id', requireAuth, deleteCardController);

export default cardsRouter;
