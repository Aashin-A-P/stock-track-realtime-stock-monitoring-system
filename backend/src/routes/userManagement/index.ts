import { Router } from 'express';
import { createUserSchema, loginSchema } from '../../db/schemas/usersSchema';
import { validateData } from '../../middlewares/validationMiddleware';
import { registerUser } from './userManagementController';

const router = Router();

router.post('/register', validateData(createUserSchema), registerUser);
// router.post('/login', validateData(loginSchema), loginUser);

export default router;
