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

const importCardSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(10_000).optional().nullable(),
});

const importListSchema = z.object({
  name: z.string().trim().min(1).max(50),
  cards: z.array(importCardSchema).default([]),
});

const importBoardSchema = z.object({
  name: z.string().trim().min(1).max(50),
  description: z.string().trim().max(120).optional().nullable(),
  color: z.string().trim().min(1).max(20),
  lists: z.array(importListSchema).default([]),
});

export const importDataSchema = z.object({
  boards: z.array(importBoardSchema).max(500),
});

export type ImportDataInput = z.infer<typeof importDataSchema>;

export const reorderBoardsSchema = z.object({
  boardIds: z.array(z.string().min(1)).max(500),
});

export type ReorderBoardsInput = z.infer<typeof reorderBoardsSchema>;