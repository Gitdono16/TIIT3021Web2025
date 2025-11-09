import { Request, Response } from "express";
import { Project } from "../models/Project";
import crypto from "crypto";
import { createGithubRepository, listOrganizationRepos } from "../services/githubService";

function generateUrlToken() {
    return crypto.randomBytes(16).toString("hex");
}

function getStudentLink(token: string) {
    return `https://gitdono16.github.io/TIIT3021Web2025/#/join/${token}`;
}

export const createProject = async (req: Request, res: Response) => {
    try {
        const { name, organizationName, minStudents, maxStudents, color } = req.body;
        const professorId = (req as any).user.id;

        let existingRepos;
        try {
            existingRepos = await listOrganizationRepos(professorId, organizationName);
        } catch {
            return res.status(400).json({
                message: `"${organizationName}" est introuvable sur GitHub.`
            });
        }

        const groupNumbers: number[] = existingRepos
            .map((repo: any) => {
                const match = repo.name.match(/^Groupe(\d+)$/i);
                return match ? parseInt(match[1], 10) : undefined;
            })
            .filter((n): n is number => typeof n === "number");

        const nextGroupNumber = groupNumbers.length > 0 ? Math.max(...groupNumbers) + 1 : 1;
        const groupName = `Groupe${nextGroupNumber.toString().padStart(2, "0")}`;

        const repoUrl = await createGithubRepository(
            professorId,
            organizationName,
            groupName
        );

        const token = generateUrlToken();

        const project = await Project.create({
            name,
            organizationName,
            minStudents,
            maxStudents,
            groupName,
            professorId,
            urlToken: token,
            repoUrl,
            color,
        });

        // ✅ Ajout du lien étudiant
        const studentLink = getStudentLink(token);

        res.status(201).json({
            ...project.toObject(),
            studentLink,
        });

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
                studentLink: getStudentLink(p.urlToken),
            }))
        );

    } catch {
        res.status(500).json({ message: "Impossible de récupérer les projets" });
    }
};

export const getProjectById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const project = await Project.findById(id);

        if (!project)
            return res.status(404).json({ message: "Projet introuvable" });

        res.json({
            ...project.toObject(),
            studentLink: getStudentLink(project.urlToken),
        });

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

        res.json({
            message: "Projet mis à jour avec succès",
            project: {
                ...project.toObject(),
                studentLink: getStudentLink(project.urlToken),
            }
        });

    } catch (err: any) {
        console.error("Erreur MAJ projet :", err.message);
        res.status(500).json({ message: "Erreur lors de la modification du projet" });
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

        const numbers: number[] = existingRepos
            .map((repo: any) => {
                const match = repo.name.match(/^Groupe(\d+)$/i);
                return match ? parseInt(match[1], 10) : undefined;
            })
            .filter((n): n is number => typeof n === "number");

        const next = numbers.length ? Math.max(...numbers) + 1 : 1;

        res.json({ nextGroup: `Groupe${next.toString().padStart(2, "0")}` });

    } catch {
        res.status(500).json({
            message: "Erreur lors de la récupération du prochain groupe."
        });
    }
};
