import { Request, Response } from "express";
import { Project } from "../models/Project";
import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";
dotenv.config();

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

/**
 * ✅ Vérifier un utilisateur GitHub
 */
export const getGitHubUser = async (req: Request, res: Response) => {
    const { username } = req.params;

    try {
        const { data } = await octokit.users.getByUsername({ username });

        return res.json({
            username: data.login,
            profile: data.html_url,
            avatar: data.avatar_url
        });

    } catch (err: any) {
        console.error("GitHub API error :", err.message);
        return res.status(404).json({ message: "Utilisateur GitHub introuvable" });
    }
};

/**
 * ✅ Récupérer le projet via URL token
 */
export const getProjectByToken = async (req: Request, res: Response) => {
    const { token } = req.params;

    const project = await Project.findOne({ urlToken: token });

    if (!project)
        return res.status(404).json({ message: "Lien expiré ou projet introuvable." });

    res.json({
        name: project.name,
        organization: project.organizationName,
        groupName: project.groupName,
        maxStudents: project.maxStudents,
        studentCount: project.students.length
    });
};


/**
 * ✅ Ajouter étudiant dans le projet
 */
export const registerStudentByToken = async (req: Request, res: Response) => {
    const { token } = req.params;
    const { github } = req.body;

    const project = await Project.findOne({ urlToken: token });

    if (!project)
        return res.status(404).json({ message: "Projet introuvable" });

    if (project.students.includes(github))
        return res.status(400).json({ message: "Déjà inscrit" });

    if (project.students.length >= project.maxStudents)
        return res.status(400).json({ message: "Projet plein" });

    project.students.push(github);
    await project.save();

    res.json({ message: "Inscription réussie" });
};
