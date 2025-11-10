import { Request, Response } from "express";
import { Project } from "../models/Project";
import { Octokit } from "@octokit/rest";

// ✅ Récupère automatiquement le bon token selon le professeur
function getProfessorGithubToken(professorId: string): string | null {
    const envVar = `PROF${professorId}_GH_TOKEN`; // Prof 1 → PROF1_GH_TOKEN
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

// ✅ Vérifie un pseudo GitHub AVEC LE BON TOKEN
export const getGitHubUser = async (req: Request, res: Response) => {
    try {
        const { username } = req.params;
        const { token } = req.query;

        // ✅ On récupère le projet pour savoir quel prof est lié
        const project = await Project.findOne({ urlToken: token });
        if (!project) return res.status(404).json({ message: "Projet introuvable" });

        // ✅ On récupère le bon token GitHub du prof
        const professorToken = getProfessorGithubToken(project.professorId);
        if (!professorToken)
            return res.status(500).json({ message: "Token GitHub professeur manquant" });

        // ✅ Appel GitHub authentifié
        const octokit = new Octokit({ auth: professorToken });

        const { data } = await octokit.users.getByUsername({ username });

        res.json({
            username: data.login,
            avatar: data.avatar_url,
            profile: data.html_url,
        });

    } catch (err: any) {
        if (err.status === 404)
            return res.status(404).json({ message: "Utilisateur introuvable" });

        return res.status(500).json({ message: "Erreur GitHub" });
    }
};

// ✅ Inscription étudiant dans le projet
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
