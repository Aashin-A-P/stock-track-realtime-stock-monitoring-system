
import { Router } from 'express';
import { createPrivilegeSchema, privilegesTable } from '../../db/schemas/privilegesSchema';
import { addPrivilege } from './PrivilegeController';
import { addUserPrivilege, addPrivilege, getAllPrivileges } from './PrivilegeController';
import { addUserPrivilegeSchema } from '../../db/schemas/UserPrivilegesschema';
import { validateData } from '../../middlewares/validationMiddleware';
import { logger } from '../../middlewares/logMiddleware';
const router = Router();

router.post('/addprivilege', validateData(createPrivilegeSchema), logger, addPrivilege);
router.post('/adduserprivilege', validateData(addUserPrivilegeSchema), logger, addUserPrivilege);
router.get('/getprivileges', logger, getAllPrivileges);

export default router;
