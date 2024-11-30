import { Router } from 'express';
import { createUserSchema, updateUserSchema } from '../../db/schemas/usersSchema';
import { validateData } from '../../middlewares/validationMiddleware';
import { deleteUser, registerUser, updateUser, getAllUsers, getUser } from './userManagementController';
import { verifyToken } from '../../middlewares/authMiddleware';

const router = Router();

router.get('/', verifyToken, getAllUsers);
router.get('/:userId', verifyToken, getUser);
router.post('/register', verifyToken, validateData(createUserSchema), registerUser);
router.put('/:userId', verifyToken, validateData(updateUserSchema), updateUser);
router.delete('/userId', verifyToken, deleteUser);

export default router;
