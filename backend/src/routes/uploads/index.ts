
import { Router } from 'express';
import { uploadImage } from './ImageController';
import { uploadSingleImage } from '../../../utils';
import { verifyToken } from '../../middlewares/authMiddleware';

const router = Router();

// @ts-ignore
router.post('/', verifyToken, uploadSingleImage('image'), uploadImage);

export default router;
