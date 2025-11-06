import { Request, Response } from "express";
import { ensureGitHubUserExists } from "../services/githubService";
import { Octokit } from "@octokit/rest";


export const checkGitHubOrganization = async (req: Request, res: Response) => {
    try {
        const { orgName } = req.params;
        const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

        await octokit.orgs.get({ org: orgName });
        res.json({ exists: true, message: "GitHub ok !" });
    } catch {
        res.status(404).json({ exists: false, message: "Orga pas trouvé " });
    }
};

export const checkGitHubUser = async (req: Request, res: Response) => {
    try {
        const { username } = req.params;
        await ensureGitHubUserExists(username);
        res.json({ exists: true, message: "Utilisateur trouvé " });
    } catch {
        res.status(404).json({ exists: false, message: "Utilisateur introuvable." });
    }
};
