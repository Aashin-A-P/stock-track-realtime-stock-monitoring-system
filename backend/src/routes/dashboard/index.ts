import { Router } from "express";
import { getAllYears, getPieChartAnalysis, getRecentLogs } from "./dashboardController";
import { AdminOnlyAccess, verifyToken } from "../../middlewares/authMiddleware";

const router = Router();

// Route to get pie chart analysis data for the given year

// @ts-ignore
router.get('/analysis', verifyToken, AdminOnlyAccess, getPieChartAnalysis);
// @ts-ignore
router.get('/recent-logs', verifyToken, AdminOnlyAccess, getRecentLogs);
// @ts-ignore
router.get('/budget-years', verifyToken, AdminOnlyAccess, getAllYears);



export default router;