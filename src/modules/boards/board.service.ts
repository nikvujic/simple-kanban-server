import { prisma } from '../../lib/prisma.js';
import type { CreateBoardInput, ImportDataInput, UpdateBoardInput } from './board.schemas.js';

export async function getBoards(userId: string) {
  return prisma.board.findMany({
    where: { userId },
    orderBy: { position: 'asc' },
  });
}

export async function getBoardById(userId: string, boardId: string) {
  const board = await prisma.board.findFirst({
    where: { id: boardId, userId },
    include: {
      lists: {
        orderBy: { position: 'asc' },
        include: {
          cards: {
            orderBy: { position: 'asc' },
          },
        },
      },
    },
  });

  if (!board) {
    throw new Error('BOARD_NOT_FOUND');
  }

  return board;
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

export async function importUserData(userId: string, data: ImportDataInput) {
  await prisma.$transaction(
    async (tx) => {
      await tx.board.deleteMany({ where: { userId } });

      for (let i = 0; i < data.boards.length; i++) {
        const board = data.boards[i]!;
        await tx.board.create({
          data: {
            userId,
            name: board.name,
            description: board.description || null,
            color: board.color,
            position: i,
            lists: {
              create: board.lists.map((list, j) => ({
                name: list.name,
                position: j,
                cards: {
                  create: list.cards.map((card, k) => ({
                    title: card.title,
                    description: card.description || null,
                    position: k,
                  })),
                },
              })),
            },
          },
        });
      }
    },
    { timeout: 30_000 },
  );
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
