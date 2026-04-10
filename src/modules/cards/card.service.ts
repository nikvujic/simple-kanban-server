import { prisma } from '../../lib/prisma.js';
import type { CreateCardInput, UpdateCardInput } from './card.schemas.js';

async function verifyBoardOwnership(boardId: string, userId: string) {
  const board = await prisma.board.findFirst({
    where: { id: boardId, userId },
  });

  if (!board) {
    throw new Error('BOARD_NOT_FOUND');
  }
}

export async function createCard(userId: string, boardId: string, listId: string, input: CreateCardInput) {
  await verifyBoardOwnership(boardId, userId);

  const list = await prisma.list.findFirst({
    where: { id: listId, boardId },
  });

  if (!list) {
    throw new Error('LIST_NOT_FOUND');
  }

  const lastCard = await prisma.card.findFirst({
    where: { listId },
    orderBy: { position: 'desc' },
  });

  return prisma.card.create({
    data: {
      listId,
      title: input.title,
      description: input.description || null,
      position: lastCard ? lastCard.position + 1 : 0,
    },
  });
}

export async function updateCard(userId: string, boardId: string, cardId: string, input: UpdateCardInput) {
  await verifyBoardOwnership(boardId, userId);

  const existingCard = await prisma.card.findFirst({
    where: { id: cardId, list: { boardId } },
  });

  if (!existingCard) {
    throw new Error('CARD_NOT_FOUND');
  }

  return prisma.card.update({
    where: { id: cardId },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description || null } : {}),
    },
  });
}

export async function deleteCard(userId: string, boardId: string, cardId: string) {
  await verifyBoardOwnership(boardId, userId);

  const existingCard = await prisma.card.findFirst({
    where: { id: cardId, list: { boardId } },
  });

  if (!existingCard) {
    throw new Error('CARD_NOT_FOUND');
  }

  await prisma.card.delete({
    where: { id: cardId },
  });
}
