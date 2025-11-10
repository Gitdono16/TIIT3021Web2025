import { Request, Response } from "express";
import { Project } from "../models/Project";
import { Octokit } from "@octokit/rest";

const professorTokens: Record<string, string | undefined> = {
    "690e8c0dcc4e1424155a60d5": process.env.PROF1_GH_TOKEN, // Prof Donovan
    "67b57bc74afdf770a0830af6": process.env.PROF2_GH_TOKEN, // Prof Admin
};

function getProfessorGithubToken(professorId: string): string | null {
    return professorTokens[professorId] || null;
}

export const getProjectByToken = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const project = await Project.findOne({ urlToken: token });

        if (!project)
            return res.status(404).json({ message: "Mauvais lien" });

        res.json({
            name: project.name,
            organization: project.organizationName,
            groupName: project.groupName,
        });

    } catch {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

export const getGitHubUser = async (req: Request, res: Response) => {
    try {
        const { username } = req.params;
        const { token } = req.query;

        if (!token) return res.status(400).json({ message: "Token manquant" });

        const project = await Project.findOne({ urlToken: token });

        if (!project)
            return res.status(404).json({ message: "Projet introuvable" });

        const professorToken = getProfessorGithubToken(project.professorId);

        if (!professorToken)
            return res.status(500).json({ message: "Token GitHub du professeur introuvable" });

        const octokit = new Octokit({ auth: professorToken });

        const response = await octokit.users.getByUsername({ username });

        res.json({
            username: response.data.login,
            avatar: response.data.avatar_url,
            profile: response.data.html_url,
        });

    } catch (err: any) {
        if (err.status === 404)
            return res.status(404).json({ message: "Utilisateur introuvable" });

        console.error("GitHub API error :", err.message);
        res.status(500).json({ message: "Erreur GitHub" });
    }
};

export const registerStudentByToken = async (req: Request, res: Response) => {
    try {
        const { github } = req.body;
        const { token } = req.params;

        const project = await Project.findOne({ urlToken: token });

        if (!project)
            return res.status(404).json({ message: "Projet introuvable" });

        if (project.students.includes(github))
            return res.status(400).json({ message: "Déjà inscrit !" });

        project.students.push(github);
        await project.save();

        res.json({ message: "Inscription confirmée" });

    } catch {
        res.status(500).json({ message: "Erreur serveur" });
    }
};
