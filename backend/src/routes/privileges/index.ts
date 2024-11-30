
import { Router } from 'express';
import { createPrivilegeSchema, privilegesTable } from '../../db/schemas/privilegesSchema';
import { addUserPrivilegeSchema, validateData } from '../../middlewares/validationMiddleware';
import { addPrivilege } from './PrivilegeController';
import { addUserPrivilege } from './PrivilegeController';
const router = Router();

router.post('/addprivilege', validateData(createPrivilegeSchema), addPrivilege);
router.post('/adduserprivilege', validateData(addUserPrivilegeSchema), addUserPrivilege);
export default router;
