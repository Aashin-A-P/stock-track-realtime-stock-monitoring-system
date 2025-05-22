import { Router } from 'express';
import { createUserSchema, loginSchema } from '../../db/schemas/usersSchema';
import { validateData } from '../../middlewares/validationMiddleware';
import { loginUser} from './authController';
import { logger } from '../../middlewares/logMiddleware';

const router = Router();

// router.post('/register', validateData(createUserSchema), registerUser);
router.post('/login', validateData(loginSchema), logger, loginUser);

export default router;
