import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import { createBoardSchema, updateBoardSchema } from './board.schemas.js';
import { getBoards, getBoardById, createBoard, updateBoard, deleteBoard } from './board.service.js';

export async function getBoardsController(req: Request, res: Response) {
  const userId = req.user!.sub;
  const boards = await getBoards(userId);

  return res.status(200).json({ boards });
}

export async function getBoardByIdController(req: Request, res: Response) {
  const userId = req.user!.sub;
  const boardId = req.params.id as string;

  try {
    const board = await getBoardById(userId, boardId);
    return res.status(200).json(board);
  } catch (error) {
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

export async function createBoardController(req: Request, res: Response) {
  try {
    const userId = req.user!.sub;
    const parsed = createBoardSchema.parse(req.body);
    const board = await createBoard(userId, parsed);

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
}

export async function updateBoardController(req: Request, res: Response) {
  try {
    const userId = req.user!.sub;
    const boardId = req.params.id as string;
    const parsed = updateBoardSchema.parse(req.body);
    const updatedBoard = await updateBoard(userId, boardId, parsed);

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

export async function deleteBoardController(req: Request, res: Response) {
  const userId = req.user!.sub;
  const boardId = req.params.id as string;

  try {
    await deleteBoard(userId, boardId);
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

    console.error(error);

    return res.status(500).json({
      error: {
        code: 'INTERNAL',
        message: 'Something went wrong',
      },
    });
  }
}
