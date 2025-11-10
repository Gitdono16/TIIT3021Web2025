import { Request, Response } from "express";
import { Project } from "../models/Project";
import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";
import { Student } from "../models/Student";

dotenv.config();

// ✅ Authentification GitHub → évite le rate limit
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

// ✅ 1. Récupère un projet via token étudiant
export const getProjectByToken = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;

        const project = await Project.findOne({ urlToken: token });

        if (!project) {
            return res.status(404).json({ message: "Projet introuvable ou expiré" });
        }

        return res.json({
            name: project.name,
            organization: project.organizationName,
            groupName: project.groupName,
            maxStudents: project.maxStudents,
            currentStudents: project.students?.length || 0,
        });

    } catch (err: any) {
        console.error("Erreur getProjectByToken :", err.message);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};

// ✅ 2. Vérification pseudo GitHub avec token → plus de rate limit
export const getGitHubUser = async (req: Request, res: Response) => {
    const { username } = req.params;

    try {
        const { data } = await octokit.users.getByUsername({ username });

        return res.json({
            username: data.login,
            profile: data.html_url,
            avatar: data.avatar_url,
        });

    } catch (err: any) {

        // ✅ Détection limit rate GitHub
        if (err.status === 403 && err.response?.data?.message?.includes("rate limit")) {
            console.error("GitHub limit exceeded !");
            return res.status(429).json({
                message: "Limite GitHub atteinte – réessayez dans 1 minute.",
            });
        }

        return res.status(404).json({ message: "Utilisateur GitHub introuvable" });
    }
};

// ✅ 3. Inscription étudiant à un projet
export const registerStudentByToken = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const { github } = req.body;

        const project = await Project.findOne({ urlToken: token });

        if (!project) {
            return res.status(404).json({ message: "Projet introuvable" });
        }

        // ✅ Vérifie si déjà plein
        if (project.students.length >= project.maxStudents) {
            return res.status(400).json({ message: "Groupe complet !" });
        }

        // ✅ Empêche doublon
        const already = await Student.findOne({ github, projectId: project._id });
        if (already) {
            return res.status(400).json({ message: "Déjà inscrit !" });
        }

        // ✅ Crée l'étudiant
        const student = await Student.create({
            github,
            projectId: project._id,
        });

        // ✅ Ajoute à la liste du projet
        project.students.push(student._id);
        await project.save();

        return res.json({ message: "Inscription réussie !" });

    } catch (err: any) {
        console.error("Erreur registerStudent :", err.message);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};
