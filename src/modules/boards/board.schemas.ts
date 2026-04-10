import { z } from 'zod';

export const createBoardSchema = z.object({
  name: z.string().trim().min(1).max(50),
  description: z.string().trim().max(120).optional().or(z.literal('')),
  color: z.string().trim().min(1).max(20),
});

export const updateBoardSchema = z.object({
  name: z.string().trim().min(1).max(50).optional(),
  description: z.string().trim().max(120).optional(),
  color: z.string().trim().min(1).max(20).optional(),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;