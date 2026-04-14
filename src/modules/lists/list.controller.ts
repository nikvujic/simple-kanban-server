import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import { createListSchema, reorderListsSchema, updateListSchema } from './list.schemas.js';
import { createList, reorderLists, updateList, deleteList } from './list.service.js';

export async function createListController(req: Request, res: Response) {
  try {
    const userId = req.user!.sub;
    const boardId = req.params.boardId as string;
    const parsed = createListSchema.parse(req.body);
    const list = await createList(userId, boardId, parsed);

    return res.status(201).json(list);
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

    console.error(error);

    return res.status(500).json({
      error: {
        code: 'INTERNAL',
        message: 'Something went wrong',
      },
    });
  }
}

export async function updateListController(req: Request, res: Response) {
  try {
    const userId = req.user!.sub;
    const boardId = req.params.boardId as string;
    const listId = req.params.id as string;
    const parsed = updateListSchema.parse(req.body);
    const updatedList = await updateList(userId, boardId, listId, parsed);

    return res.status(200).json(updatedList);
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

export async function reorderListsController(req: Request, res: Response) {
  try {
    const userId = req.user!.sub;
    const boardId = req.params.boardId as string;
    const parsed = reorderListsSchema.parse(req.body);
    await reorderLists(userId, boardId, parsed);

    return res.status(204).send();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: { code: 'VALIDATION', message: 'Invalid request data', details: error.issues },
      });
    }
    if (error instanceof Error && error.message === 'BOARD_NOT_FOUND') {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Board not found' },
      });
    }
    if (error instanceof Error && error.message === 'REORDER_MISMATCH') {
      return res.status(400).json({
        error: { code: 'VALIDATION', message: 'listIds must include every list on the board exactly once' },
      });
    }

    console.error(error);
    return res.status(500).json({
      error: { code: 'INTERNAL', message: 'Something went wrong' },
    });
  }
}

export async function deleteListController(req: Request, res: Response) {
  const userId = req.user!.sub;
  const boardId = req.params.boardId as string;
  const listId = req.params.id as string;

  try {
    await deleteList(userId, boardId, listId);
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
