import { Router } from "express";
import { loginProfessor } from "../controllers/authController";

const router = Router();
router.post("/login", loginProfessor);
export default router;
