import { Router } from 'express';
import { ZodError } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import {
  createListSchema,
  updateListSchema,
} from '../modules/lists/list.schemas.js';

const listsRouter = Router();

listsRouter.post('/boards/:boardId/lists', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.sub;
    const boardId = req.params.boardId as string;
    const parsed = createListSchema.parse(req.body);

    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        userId,
      },
    });

    if (!board) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Board not found',
        },
      });
    }

    const lastList = await prisma.list.findFirst({
      where: { boardId },
      orderBy: { position: 'desc' },
    });

    const list = await prisma.list.create({
      data: {
        boardId,
        name: parsed.name,
        position: lastList ? lastList.position + 1 : 0,
      },
    });

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

    console.error(error);

    return res.status(500).json({
      error: {
        code: 'INTERNAL',
        message: 'Something went wrong',
      },
    });
  }
});

listsRouter.patch('/boards/:boardId/lists/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.sub;
    const boardId = req.params.boardId as string;
    const listId = req.params.id as string;
    const parsed = updateListSchema.parse(req.body);

    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        userId,
      },
    });

    if (!board) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Board not found',
        },
      });
    }

    const existingList = await prisma.list.findFirst({
      where: {
        id: listId,
        boardId,
      },
    });

    if (!existingList) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'List not found',
        },
      });
    }

    const updatedList = await prisma.list.update({
      where: { id: listId },
      data: {
        name: parsed.name,
      },
    });

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

    console.error(error);

    return res.status(500).json({
      error: {
        code: 'INTERNAL',
        message: 'Something went wrong',
      },
    });
  }
});

listsRouter.delete('/boards/:boardId/lists/:id', requireAuth, async (req, res) => {
  const userId = req.user!.sub;
  const boardId = req.params.boardId as string;
  const listId = req.params.id as string;

  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      userId,
    },
  });

  if (!board) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Board not found',
      },
    });
  }

  const existingList = await prisma.list.findFirst({
    where: {
      id: listId,
      boardId,
    },
  });

  if (!existingList) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'List not found',
      },
    });
  }

  await prisma.list.delete({
    where: { id: listId },
  });

  return res.status(204).send();
});

export default listsRouter;