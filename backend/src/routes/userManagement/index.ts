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

const router = Router();

router.get("/", verifyToken, getAllUsers);
router.get("/:userId", verifyToken, getUser);
router.post(
  "/register",
  verifyToken,
  validateData(createUserSchema),
  logger,
  registerUser
);
router.put(
  "/:userId",
  verifyToken,
  validateData(updateUserSchema),
  logger,
  updateUser
);
router.delete("/:userId", verifyToken, logger, deleteUser);

export default router;
