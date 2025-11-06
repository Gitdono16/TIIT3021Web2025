import { Router } from "express";
import {getProjectByToken, registerStudentByToken, getGitHubUser
} from "../controllers/studentController";

const router = Router();

router.get("/project/:token", getProjectByToken);
router.get("/github/:username", getGitHubUser);
router.post("/join/:token", registerStudentByToken);

export default router;
