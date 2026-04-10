import { z } from 'zod';

export const createListSchema = z.object({
  name: z.string().trim().min(1).max(50),
});

export const updateListSchema = z.object({
  name: z.string().trim().min(1).max(50),
});