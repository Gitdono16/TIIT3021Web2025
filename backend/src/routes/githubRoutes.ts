import { Router } from "express";
import { checkGitHubOrganization, checkGitHubUser } from "../controllers/githubController";

const router = Router();

router.get("/check-org/:orgName", checkGitHubOrganization);
router.get("/check-user/:username", checkGitHubUser);

export default router;
