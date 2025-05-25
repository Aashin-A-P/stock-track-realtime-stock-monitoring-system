import {  getRecentLogs } from "./logsController";
import { Router } from "express";
import {  verifyToken } from "../../middlewares/authMiddleware";
import { hasPrivilege,loadUserPrivileges } from "../../middlewares/privilegeMiddleware";

const router = Router();
router.get('/recent-logs', verifyToken,loadUserPrivileges,hasPrivilege('read_log'), getRecentLogs);
export default router;