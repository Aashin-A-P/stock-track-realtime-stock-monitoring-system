import {  getRecentLogs } from "./logsController";
import { Router } from "express";
import {  verifyToken } from "../../middlewares/authMiddleware";

const router = Router();
router.get('/recent-logs', verifyToken, getRecentLogs);
export default router;