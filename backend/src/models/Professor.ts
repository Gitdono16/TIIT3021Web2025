import mongoose, { Schema, Document } from "mongoose";

export interface IProfessor extends Document {
    name: string;                 // Nom du professeur
    email: string;                // Email de connexion
    password: string;             // Mot de passe
    githubTokenIv: string;        // IV pour le chiffrement du token GitHub
    githubTokenData: string;      // Données chiffrées
    githubTokenTag: string;       // authentification
    createdAt: Date;
    updatedAt: Date;
}

const professorSchema = new Schema<IProfessor>(
    {
        name: {type: String, required: true, trim: true,},
        email: {type: String, required: true, unique: true, lowercase: true, trim: true,},
        password: {type: String, required: true,},
        githubTokenIv: {type: String, required: true,},
        githubTokenData: {type: String, required: true,},
        githubTokenTag: {type: String, required: true,},
    },
    {
        timestamps: true,
    }
);

professorSchema.index({ email: 1 });
export const Professor = mongoose.model<IProfessor>("Professor", professorSchema);
