import { Request, Response } from "express";
import { Project } from "../models/Project";
import axios from "axios";
import {ensureGitHubUserExists, addCollaboratorToProjectRepo, } from "../services/githubService";
//
export const getProjectByToken = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const project = await Project.findOne({ urlToken: token });

        if (!project) {
            return res.status(404).json({ message: "Projet non trouvé" });
        }

        res.json({
            name: project.name,
            groupName: project.groupName,
            organization: project.organizationName,
            maxStudents: project.maxStudents,
            studentCount: project.students.length,
        });
    } catch {
        res.status(500).json({ message: "Erreurs lors du chargement du projet" });
    }
};

export const registerStudentByToken = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const { github } = req.body;

        const project = await Project.findOne({ urlToken: token });
        if (!project) {
            return res.status(404).json({ message: "Projet introuvable" });
        }

        if (project.students.includes(github)) {
            return res.status(400).json({
                message: "Vous êtes déjà inscrit!.",
            });
        }

        if (project.students.length >= project.maxStudents) {
            return res.status(400).json({
                message: "maximum d'étudiants.",
            });
        }

        await ensureGitHubUserExists(github);
        await addCollaboratorToProjectRepo(
            project.professorId,
            project.organizationName,
            project.groupName,
            github
        );


        project.students.push(github);
        await project.save();

        res.json({
            message: "Une invitation GitHub va être envoyée sur votre adresse mail.",
        });
    } catch (err: any) {
        console.error("Erreur inscription! :", err.message);
        return res.status(500).json({ message: err.message });
    }
};

// on recupere la photo, pseudo de l'étudiant.
export const getGitHubUser = async (req: Request, res: Response) => {
    try {
        const { username } = req.params;

        if (!username) {
            return res.status(400).json({ message: "Nom d'utilisateur manquant" });
        }

        const response = await axios.get(`https://api.github.com/users/${username}`);

        res.json({
            username: response.data.login,
            avatar: response.data.avatar_url,
            profile: response.data.html_url,
        });
    } catch {
        return res.status(404).json({ message: "Utilisateur GitHub non trouvé" });
    }
};
