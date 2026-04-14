import { prisma } from '../../lib/prisma.js';
import type {
  CreateBoardInput,
  ImportDataInput,
  ReorderBoardsInput,
  UpdateBoardInput,
} from './board.schemas.js';

export async function getBoards(userId: string) {
  return prisma.board.findMany({
    where: { userId },
    orderBy: { position: 'asc' },
    include: {
      _count: { select: { lists: true } },
    },
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

export async function reorderBoards(userId: string, input: ReorderBoardsInput) {
  await prisma.$transaction(async (tx) => {
    const owned = await tx.board.findMany({
      where: { userId },
      select: { id: true },
    });
    const ownedIds = new Set(owned.map((b) => b.id));

    if (input.boardIds.length !== ownedIds.size) {
      throw new Error('REORDER_MISMATCH');
    }
    for (const id of input.boardIds) {
      if (!ownedIds.has(id)) throw new Error('REORDER_MISMATCH');
    }

    for (let i = 0; i < input.boardIds.length; i++) {
      await tx.board.update({
        where: { id: input.boardIds[i]! },
        data: { position: i },
      });
    }
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
