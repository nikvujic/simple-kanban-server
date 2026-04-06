import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { prisma } from '../lib/prisma.js';

const meRouter = Router();

meRouter.get('/me', requireAuth, async (req, res) => {
  const userId = req.user!.sub;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'User not found',
      },
    });
  }

  return res.status(200).json({ user });
});

export default meRouter;