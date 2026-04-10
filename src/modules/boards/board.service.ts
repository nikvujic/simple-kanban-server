import { prisma } from '../../lib/prisma.js';
import type { CreateBoardInput, UpdateBoardInput } from './board.schemas.js';

export async function getBoards(userId: string) {
  return prisma.board.findMany({
    where: { userId },
    orderBy: { position: 'asc' },
  });
}

export async function createBoard(userId: string, input: CreateBoardInput) {
  const lastBoard = await prisma.board.findFirst({
    where: { userId },
    orderBy: { position: 'desc' },
  });

  return prisma.board.create({
    data: {
      userId,
      name: input.name,
      description: input.description || null,
      color: input.color,
      position: lastBoard ? lastBoard.position + 1 : 0,
    },
  });
}

export async function updateBoard(userId: string, boardId: string, input: UpdateBoardInput) {
  const existingBoard = await prisma.board.findFirst({
    where: { id: boardId, userId },
  });

  if (!existingBoard) {
    throw new Error('BOARD_NOT_FOUND');
  }

  return prisma.board.update({
    where: { id: boardId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description || null } : {}),
      ...(input.color !== undefined ? { color: input.color } : {}),
    },
  });
}

export async function deleteBoard(userId: string, boardId: string) {
  const existingBoard = await prisma.board.findFirst({
    where: { id: boardId, userId },
  });

  if (!existingBoard) {
    throw new Error('BOARD_NOT_FOUND');
  }

  await prisma.board.delete({
    where: { id: boardId },
  });
}
