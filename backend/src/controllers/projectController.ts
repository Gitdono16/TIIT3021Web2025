import { Request, Response } from "express";
import { Project } from "../models/Project";
import crypto from "crypto";
import { createGithubRepository, listOrganizationRepos } from "../services/githubService";

// token URL pour l'utilisateur
function generateUrlToken() {
    return crypto.randomBytes(16).toString("hex");
}

function studentJoinUrl(token: string) {
    return `https://gitdono16.github.io/TIIT3021Web2025/#/join/${token}`;
}
// Créer le projet
export const createProject = async (req: Request, res: Response) => {
    try {
        const { name, organizationName, minStudents, maxStudents, color } = req.body;
        const professorId = (req as any).user.id;

        // organisation
        let existingRepos;
        try {
            existingRepos = await listOrganizationRepos(professorId, organizationName);
        } catch {
            return res.status(400).json({
                message: `"${organizationName}" est introuvable sur GitHub.`
            });
        }
        const groupNumbers = existingRepos
            .map((repo: any) => {
                const m = repo.name.match(/^Groupe(\d+)$/i);
                return m ? parseInt(m[1], 10) : null;
            })
            .filter((n: number | null): n is number => n !== null);

        const nextGroupNumber = groupNumbers.length ? Math.max(...groupNumbers) + 1 : 1;
        const groupName = `Groupe${nextGroupNumber.toString().padStart(2, "0")}`;

        // Création dépôt GitHub
        const repoUrl = await createGithubRepository(
            professorId,
            organizationName,
            groupName
        );

        // Enregistre bien organizationName
        const project = await Project.create({
            name,
            organizationName,
            minStudents,
            maxStudents,
            groupName,
            professorId,
            urlToken: generateUrlToken(),
            repoUrl,
            color,
        });

        res.status(201).json(project);
    } catch (error: any) {
        console.error("Erreur création projet :", error.message);
        res.status(400).json({ message: error.message });
    }
};

export const getMyProjects = async (req: Request, res: Response) => {
    try {
        const professorId = (req as any).user.id;
        const projects = await Project.find({ professorId }).sort({ createdAt: -1 });

        res.json(
            projects.map((p: any) => ({
                ...p.toObject(),
                studentCount: p.students?.length || 0,
            }))
        );
    } catch {
        res.status(500).json({ message: "Impossible de recup les projets" });
    }
};

export const getProjectById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const project = await Project.findById(id);

        if (!project)
            return res.status(404).json({ message: "Projet introuvable" });

        res.json(project);
    } catch {
        res.status(500).json({ message: "Erreur lors de la récupération du projet." });
    }
};

export const updateProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, organizationName, minStudents, maxStudents, color } = req.body;

        const project = await Project.findByIdAndUpdate(
            id,
            { name, organizationName, minStudents, maxStudents, color },
            { new: true }
        );

        if (!project)
            return res.status(404).json({ message: "Projet introuvable" });

        res.json({ message: "Projet MAJ avec succès", project });
    } catch (err: any) {
        console.error("Erreur MAJ projet :", err.message);
        res.status(500).json({ message: "Erreur modification projet" });
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const deleted = await Project.findByIdAndDelete(id);
        if (!deleted)
            return res.status(404).json({ message: "Projet introuvable!" });

        res.json({ message: "Projet supprimé!" });
    } catch (err: any) {
        console.error("Erreur suppression projet :", err.message);
        res.status(500).json({ message: "Erreur lors de la suppression du projet." });
    }
};

export const getNextGroupName = async (req: Request, res: Response) => {
    try {
        const { organizationName } = req.query;
        const professorId = (req as any).user.id;

        if (!organizationName)
            return res.status(400).json({ message: "Organisation manquante." });

        let existingRepos;
        try {
            existingRepos = await listOrganizationRepos(
                professorId,
                organizationName as string
            );
        } catch {
            return res.status(400).json({
                message: `L'organisation "${organizationName}" est introuvable sur GitHub.`
            });
        }

        const numbers = existingRepos
            .map((repo: any) => {
                const m = repo.name.match(/^Groupe(\d+)$/i);
                return m ? parseInt(m[1], 10) : null;
            })
            // ✅ Filtrage strict encore ici
            .filter((n: number | null): n is number => n !== null);

        const next = numbers.length ? Math.max(...numbers) + 1 : 1;

        res.json({ nextGroup: `Groupe${next.toString().padStart(2, "0")}` });
    } catch {
        res.status(500).json({ message: "Erreur pour la récuperation du prochain groupe." });
    }
};
