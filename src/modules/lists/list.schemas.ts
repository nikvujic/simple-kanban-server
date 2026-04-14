import { z } from 'zod';

export const createListSchema = z.object({
  name: z.string().trim().min(1).max(50),
});

export const updateListSchema = z.object({
  name: z.string().trim().min(1).max(50),
});

export const reorderListsSchema = z.object({
  listIds: z.array(z.string().min(1)).max(500),
});

export type CreateListInput = z.infer<typeof createListSchema>;
export type UpdateListInput = z.infer<typeof updateListSchema>;
export type ReorderListsInput = z.infer<typeof reorderListsSchema>;