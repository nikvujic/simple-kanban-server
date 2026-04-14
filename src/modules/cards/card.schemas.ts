import { z } from 'zod';

export const createCardSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().optional(),
});

export const updateCardSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().optional(),
});

export const moveCardSchema = z.object({
  destinationListId: z.string().min(1),
  destinationIndex: z.number().int().min(0),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type MoveCardInput = z.infer<typeof moveCardSchema>;