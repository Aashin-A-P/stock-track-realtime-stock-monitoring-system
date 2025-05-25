
import { Router } from 'express';
import { createPrivilegeSchema, privilegesTable } from '../../db/schemas/privilegesSchema';
import { addUserPrivilege, addPrivilege, getAllPrivileges, getUserPrivileges } from './PrivilegeController';
import { addUserPrivilegeSchema } from '../../db/schemas/UserPrivilegesschema';
import { validateData } from '../../middlewares/validationMiddleware';
import { logger } from '../../middlewares/logMiddleware';
const router = Router();

router.post('/addprivilege', validateData(createPrivilegeSchema), logger, addPrivilege);
router.post('/adduserprivileges', validateData(addUserPrivilegeSchema), logger, addUserPrivilege);
router.get('/getprivileges', getAllPrivileges);
router.get('/:userId', getUserPrivileges);

export default router;
