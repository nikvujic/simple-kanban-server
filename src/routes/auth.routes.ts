import { Router } from 'express';
import { loginController } from '../modules/auth/auth.controller.js';

const authRouter = Router();

authRouter.post('/login', loginController);

export default authRouter;