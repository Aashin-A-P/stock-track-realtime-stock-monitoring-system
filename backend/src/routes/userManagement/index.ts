import { Router } from 'express';
import { createUserSchema, deleteUserSchema, loginSchema } from '../../db/schemas/usersSchema';
import { validateData } from '../../middlewares/validationMiddleware';
import { deleteUser, registerUser } from './userManagementController';

const router = Router();

router.post('/register', validateData(createUserSchema), registerUser);
router.delete('/delete', validateData(deleteUserSchema), deleteUser);

export default router;
