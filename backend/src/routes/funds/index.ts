import { Router } from "express";
import { verifyToken } from "../../middlewares/authMiddleware";
import { addBudget, deleteBudget, searchBudget, showBudget, showBudgets, updateBudget } from "./budgesController";

const router = Router();
// @ts-ignore
router.get("/search", verifyToken, searchBudget);
// @ts-ignore
router.post("/", verifyToken, addBudget);
router.get("/", verifyToken, showBudgets);
// @ts-ignore
router.get("/:id", verifyToken, showBudget);
// @ts-ignore
router.put("/:id", verifyToken, updateBudget);
// @ts-ignore
router.delete("/:id", verifyToken, deleteBudget);

export default router;
