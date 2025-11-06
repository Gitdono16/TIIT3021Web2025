import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Professor } from "../models/Professor";

export const loginProfessor = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const prof = await Professor.findOne({ email });
        if (!prof) return res.status(401).json({ message: "erreur user" });

        const isValid = await bcrypt.compare(password, prof.password);
        if (!isValid) return res.status(401).json({ message: "MDP incorrect" });

        const token = jwt.sign(
            { id: prof._id, email: prof.email },
            process.env.JWT_SECRET!,
            { expiresIn: "2h" }
        );

        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};
