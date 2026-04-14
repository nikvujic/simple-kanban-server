import { prisma } from '../../lib/prisma.js';
import type { CreateListInput, ReorderListsInput, UpdateListInput } from './list.schemas.js';

async function verifyBoardOwnership(boardId: string, userId: string) {
  const board = await prisma.board.findFirst({
    where: { id: boardId, userId },
  });

  if (!board) {
    throw new Error('BOARD_NOT_FOUND');
  }
}

export async function createList(userId: string, boardId: string, input: CreateListInput) {
  await verifyBoardOwnership(boardId, userId);

  const lastList = await prisma.list.findFirst({
    where: { boardId },
    orderBy: { position: 'desc' },
  });

  return prisma.list.create({
    data: {
      boardId,
      name: input.name,
      position: lastList ? lastList.position + 1 : 0,
    },
  });
}

export async function updateList(userId: string, boardId: string, listId: string, input: UpdateListInput) {
  await verifyBoardOwnership(boardId, userId);

  const existingList = await prisma.list.findFirst({
    where: { id: listId, boardId },
  });

  if (!existingList) {
    throw new Error('LIST_NOT_FOUND');
  }

  return prisma.list.update({
    where: { id: listId },
    data: { name: input.name },
  });
}

export async function reorderLists(userId: string, boardId: string, input: ReorderListsInput) {
  await verifyBoardOwnership(boardId, userId);

  await prisma.$transaction(async (tx) => {
    const existing = await tx.list.findMany({
      where: { boardId },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((l) => l.id));

    if (input.listIds.length !== existingIds.size) {
      throw new Error('REORDER_MISMATCH');
    }
    for (const id of input.listIds) {
      if (!existingIds.has(id)) throw new Error('REORDER_MISMATCH');
    }

    for (let i = 0; i < input.listIds.length; i++) {
      await tx.list.update({
        where: { id: input.listIds[i]! },
        data: { position: i },
      });
    }
  });
}

export async function deleteList(userId: string, boardId: string, listId: string) {
  await verifyBoardOwnership(boardId, userId);

  const existingList = await prisma.list.findFirst({
    where: { id: listId, boardId },
  });

  if (!existingList) {
    throw new Error('LIST_NOT_FOUND');
  }

  await prisma.list.delete({
    where: { id: listId },
  });
}
