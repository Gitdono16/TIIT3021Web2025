import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
    createProject,
    getMyProjects,
    deleteProject,
    getProjectById,
    updateProject,
    getNextGroupName
} from "../controllers/projectController";

const router = Router();

router.post("/", authMiddleware, createProject);
router.get("/", authMiddleware, getMyProjects);
router.get("/next-group", authMiddleware, getNextGroupName); // 🆕
router.get("/:id", authMiddleware, getProjectById);
router.put("/:id", authMiddleware, updateProject);
router.delete("/:id", authMiddleware, deleteProject);

export default router;
