import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import { createCardSchema, moveCardSchema, updateCardSchema } from './card.schemas.js';
import { createCard, moveCard, updateCard, deleteCard } from './card.service.js';

export async function createCardController(req: Request, res: Response) {
  try {
    const userId = req.user!.sub;
    const boardId = req.params.boardId as string;
    const listId = req.params.listId as string;
    const parsed = createCardSchema.parse(req.body);
    const card = await createCard(userId, boardId, listId, parsed);

    return res.status(201).json(card);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION',
          message: 'Invalid request data',
          details: error.issues,
        },
      });
    }

    if (error instanceof Error && error.message === 'BOARD_NOT_FOUND') {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Board not found',
        },
      });
    }

    if (error instanceof Error && error.message === 'LIST_NOT_FOUND') {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'List not found',
        },
      });
    }

    console.error(error);

    return res.status(500).json({
      error: {
        code: 'INTERNAL',
        message: 'Something went wrong',
      },
    });
  }
}

export async function updateCardController(req: Request, res: Response) {
  try {
    const userId = req.user!.sub;
    const boardId = req.params.boardId as string;
    const cardId = req.params.id as string;
    const parsed = updateCardSchema.parse(req.body);
    const updatedCard = await updateCard(userId, boardId, cardId, parsed);

    return res.status(200).json(updatedCard);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION',
          message: 'Invalid request data',
          details: error.issues,
        },
      });
    }

    if (error instanceof Error && error.message === 'BOARD_NOT_FOUND') {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Board not found',
        },
      });
    }

    if (error instanceof Error && error.message === 'CARD_NOT_FOUND') {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Card not found',
        },
      });
    }

    console.error(error);

    return res.status(500).json({
      error: {
        code: 'INTERNAL',
        message: 'Something went wrong',
      },
    });
  }
}

export async function moveCardController(req: Request, res: Response) {
  try {
    const userId = req.user!.sub;
    const boardId = req.params.boardId as string;
    const cardId = req.params.id as string;
    const parsed = moveCardSchema.parse(req.body);
    await moveCard(userId, boardId, cardId, parsed);

    return res.status(204).send();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: { code: 'VALIDATION', message: 'Invalid request data', details: error.issues },
      });
    }
    if (error instanceof Error && error.message === 'BOARD_NOT_FOUND') {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Board not found' } });
    }
    if (error instanceof Error && error.message === 'LIST_NOT_FOUND') {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Destination list not found' } });
    }
    if (error instanceof Error && error.message === 'CARD_NOT_FOUND') {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Card not found' } });
    }

    console.error(error);
    return res.status(500).json({ error: { code: 'INTERNAL', message: 'Something went wrong' } });
  }
}

export async function deleteCardController(req: Request, res: Response) {
  const userId = req.user!.sub;
  const boardId = req.params.boardId as string;
  const cardId = req.params.id as string;

  try {
    await deleteCard(userId, boardId, cardId);
    return res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === 'BOARD_NOT_FOUND') {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Board not found',
        },
      });
    }

    if (error instanceof Error && error.message === 'CARD_NOT_FOUND') {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Card not found',
        },
      });
    }

    console.error(error);

    return res.status(500).json({
      error: {
        code: 'INTERNAL',
        message: 'Something went wrong',
      },
    });
  }
}
