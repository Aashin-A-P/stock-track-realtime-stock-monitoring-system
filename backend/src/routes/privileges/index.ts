
import { Router } from 'express';
import { createPrivilegeSchema, privilegesTable } from '../../db/schemas/privilegesSchema';
import { addPrivilege } from './PrivilegeController';
import { addUserPrivilege } from './PrivilegeController';
import { addUserPrivilegeSchema } from '../../db/schemas/UserPrivilegesschema';
import { validateData } from '../../middlewares/validationMiddleware';
const router = Router();

router.post('/addprivilege', validateData(createPrivilegeSchema), addPrivilege);
router.post('/adduserprivilege', validateData(addUserPrivilegeSchema), addUserPrivilege);
export default router;
