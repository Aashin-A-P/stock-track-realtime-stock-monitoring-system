
import { Router } from 'express';
import { createPrivilegeSchema, privilegesTable } from '../../db/schemas/privilegesSchema';
import { validateData } from '../../middlewares/validationMiddleware';
import { addPrivilege } from './PrivilegeController';

const router = Router();

router.post('/addprivilege', validateData(createPrivilegeSchema), addPrivilege);

export default router;
