import { Router } from 'express';
import { ZodError } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import {
  createBoardSchema,
  updateBoardSchema,
} from '../modules/boards/board.schemas.js';

const boardsRouter = Router();

boardsRouter.get('/boards', requireAuth, async (req, res) => {
  const userId = req.user!.sub;

  const boards = await prisma.board.findMany({
    where: { userId },
    orderBy: { position: 'asc' },
  });

  return res.status(200).json({ boards });
});

boardsRouter.post('/boards', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.sub;
    const parsed = createBoardSchema.parse(req.body);

    const lastBoard = await prisma.board.findFirst({
      where: { userId },
      orderBy: { position: 'desc' },
    });

    const board = await prisma.board.create({
      data: {
        userId,
        name: parsed.name,
        description: parsed.description || null,
        color: parsed.color,
        position: lastBoard ? lastBoard.position + 1 : 0,
      },
    });

    return res.status(201).json(board);
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

boardsRouter.patch('/boards/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.sub;
    const boardId = req.params.id as string;
    const parsed = updateBoardSchema.parse(req.body);

    const existingBoard = await prisma.board.findFirst({
      where: {
        id: boardId,
        userId,
      },
    });

    if (!existingBoard) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Board not found',
        },
      });
    }

    const updatedBoard = await prisma.board.update({
      where: { id: boardId },
      data: {
        ...(parsed.name !== undefined ? { name: parsed.name } : {}),
        ...(parsed.description !== undefined
          ? { description: parsed.description || null }
          : {}),
        ...(parsed.color !== undefined ? { color: parsed.color } : {}),
      },
    });

    return res.status(200).json(updatedBoard);
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

boardsRouter.delete('/boards/:id', requireAuth, async (req, res) => {
  const userId = req.user!.sub;
  const boardId = req.params.id;

  const existingBoard = await prisma.board.findFirst({
    where: {
      id: boardId as string,
      userId,
    },
  });

  if (!existingBoard) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Board not found',
      },
    });
  }

  await prisma.board.delete({
    where: { id: boardId as string },
  });

  return res.status(204).send();
});

export default boardsRouter;