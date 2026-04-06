import type { Request, Response } from 'express';
import { loginSchema } from './auth.schemas.js';
import { loginUser } from './auth.service.js';

export async function loginController(req: Request, res: Response) {
  try {
    const parsed = loginSchema.parse(req.body);
    const result = await loginUser(parsed);

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        },
      });
    }

    return res.status(400).json({
      error: {
        code: 'BAD_REQUEST',
        message: 'Invalid request',
      },
    });
  }
}