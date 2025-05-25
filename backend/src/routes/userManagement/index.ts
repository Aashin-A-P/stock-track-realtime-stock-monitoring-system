import { Router } from "express";
import {
  createUserSchema,
  updateUserSchema,
} from "../../db/schemas/usersSchema";
import { validateData } from "../../middlewares/validationMiddleware";
import {
  deleteUser,
  registerUser,
  updateUser,
  getAllUsers,
  getUser,
} from "./userManagementController";
import { verifyToken } from "../../middlewares/authMiddleware";
import { logger } from "../../middlewares/logMiddleware";
import { hasPrivilege,loadUserPrivileges } from "../../middlewares/privilegeMiddleware";

const router = Router();

router.get("/", verifyToken, getAllUsers);
router.get("/:userId", verifyToken,hasPrivilege('read_user'), getUser);
router.post(
  "/register",
  verifyToken,
  loadUserPrivileges,
  hasPrivilege('create_user'),
  validateData(createUserSchema),
  logger,
  registerUser
);
router.put(
  "/:userId",
  verifyToken,
  loadUserPrivileges,
  hasPrivilege('update_user'),
  validateData(updateUserSchema),
  logger,
  updateUser
);
router.delete("/:userId", verifyToken,loadUserPrivileges, hasPrivilege('delete_user'),logger, deleteUser);

export default router;
