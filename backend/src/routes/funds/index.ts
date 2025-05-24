import { Router } from "express";
import { verifyToken } from "../../middlewares/authMiddleware";
import { addBudget, deleteBudget, searchBudget, showBudget, showBudgets, updateBudget } from "./budgesController";
import { logger } from "../../middlewares/logMiddleware";
import { hasPrivilege,loadUserPrivileges } from "../../middlewares/privilegeMiddleware";

const router = Router();
// @ts-ignore
router.get("/search", verifyToken,loadUserPrivileges,hasPrivilege('read_budgets'), searchBudget);
// @ts-ignore
router.post("/", verifyToken,loadUserPrivileges,hasPrivilege('create_budgets'), logger, addBudget);
router.get("/", verifyToken, showBudgets);
// @ts-ignore
router.get("/:id", verifyToken,loadUserPrivileges,hasPrivilege('read_budgets'), showBudget);
// @ts-ignore
router.put("/:id", verifyToken,loadUserPrivileges,hasPrivilege('update_budgets'), logger, updateBudget);
// @ts-ignore
router.delete("/:id", verifyToken,loadUserPrivileges,hasPrivilege('delete_budgets'), logger, deleteBudget);

export default router;
