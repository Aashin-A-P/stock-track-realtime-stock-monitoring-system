import { Router } from "express";
import { verifyToken } from "../../middlewares/authMiddleware";
import { addBudget, deleteBudget, searchBudget, showBudget, showBudgets, updateBudget } from "./budgesController";
import { logger } from "../../middlewares/logMiddleware";

const router = Router();
// @ts-ignore
router.get("/search", verifyToken, searchBudget);
// @ts-ignore
router.post("/", verifyToken, logger, addBudget);
router.get("/", verifyToken, showBudgets);
// @ts-ignore
router.get("/:id", verifyToken, showBudget);
// @ts-ignore
router.put("/:id", verifyToken, logger, updateBudget);
// @ts-ignore
router.delete("/:id", verifyToken, logger, deleteBudget);

export default router;
