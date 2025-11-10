import { Request, Response } from "express";
import { Project } from "../models/Project";
import { Octokit } from "@octokit/rest";

// ✅ Récupère automatiquement le bon token selon le professeur
function getProfessorGithubToken(professorId: string): string | null {
    const envVar = `PROF${professorId}_GH_TOKEN`;
    return process.env[envVar] || null;
}

// ✅ Étudiant ouvre son lien → récupérer le projet
export const getProjectByToken = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const project = await Project.findOne({ urlToken: token });

        if (!project)
            return res.status(404).json({ message: "Lien invalide ou expiré." });

        res.json({
            name: project.name,
            organization: project.organizationName,
            groupName: project.groupName,
        });

    } catch {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// ✅ Vérifie un pseudo GitHub AVEC TOKEN PROF
export const getGitHubUser = async (req: Request, res: Response) => {
    try {
        const { username } = req.params;
        const { token } = req.query;

        if (!token) return res.status(400).json({ message: "Token manquant" });

        // ✅ On cherche le projet lié au token
        const project = await Project.findOne({ urlToken: token });
        if (!project) return res.status(404).json({ message: "Projet introuvable" });

        // ✅ On convertit bien ObjectId → string
        const professorId = project.professorId.toString();
        const professorToken = getProfessorGithubToken(professorId);

        if (!professorToken)
            return res.status(500).json({ message: "Token GitHub professeur manquant" });

        const octokit = new Octokit({ auth: professorToken });

        const { data } = await octokit.users.getByUsername({ username });

        res.json({
            username: data.login,
            avatar: data.avatar_url,
            profile: data.html_url,
        });

    } catch (err: any) {
        if (err.status === 404)
            return res.status(404).json({ message: "Utilisateur GitHub introuvable" });

        return res.status(500).json({ message: "Erreur GitHub" });
    }
};

// ✅ Inscription étudiant
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

        res.json({ message: "Inscription confirmée ✅" });

    } catch {
        res.status(500).json({ message: "Erreur serveur" });
    }
};
