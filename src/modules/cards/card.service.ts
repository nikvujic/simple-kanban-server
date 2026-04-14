import { prisma } from '../../lib/prisma.js';
import type { CreateCardInput, MoveCardInput, UpdateCardInput } from './card.schemas.js';

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

export async function moveCard(
  userId: string,
  boardId: string,
  cardId: string,
  input: MoveCardInput,
) {
  await verifyBoardOwnership(boardId, userId);

  await prisma.$transaction(async (tx) => {
    const card = await tx.card.findFirst({
      where: { id: cardId, list: { boardId } },
      select: { id: true, listId: true },
    });
    if (!card) throw new Error('CARD_NOT_FOUND');

    const destList = await tx.list.findFirst({
      where: { id: input.destinationListId, boardId },
      select: { id: true },
    });
    if (!destList) throw new Error('LIST_NOT_FOUND');

    if (card.listId === input.destinationListId) {
      const siblings = await tx.card.findMany({
        where: { listId: input.destinationListId },
        orderBy: { position: 'asc' },
        select: { id: true },
      });
      const without = siblings.filter((c) => c.id !== cardId).map((c) => c.id);
      const clampedIndex = Math.min(input.destinationIndex, without.length);
      without.splice(clampedIndex, 0, cardId);

      for (let i = 0; i < without.length; i++) {
        await tx.card.update({
          where: { id: without[i]! },
          data: { position: i },
        });
      }
    } else {
      const sourceSiblings = await tx.card.findMany({
        where: { listId: card.listId, id: { not: cardId } },
        orderBy: { position: 'asc' },
        select: { id: true },
      });
      const destSiblings = await tx.card.findMany({
        where: { listId: input.destinationListId },
        orderBy: { position: 'asc' },
        select: { id: true },
      });
      const clampedIndex = Math.min(input.destinationIndex, destSiblings.length);
      const destIds = destSiblings.map((c) => c.id);
      destIds.splice(clampedIndex, 0, cardId);

      for (let i = 0; i < sourceSiblings.length; i++) {
        await tx.card.update({
          where: { id: sourceSiblings[i]!.id },
          data: { position: i },
        });
      }
      for (let i = 0; i < destIds.length; i++) {
        if (destIds[i] === cardId) {
          await tx.card.update({
            where: { id: cardId },
            data: { position: i, listId: input.destinationListId },
          });
        } else {
          await tx.card.update({
            where: { id: destIds[i]! },
            data: { position: i },
          });
        }
      }
    }
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
