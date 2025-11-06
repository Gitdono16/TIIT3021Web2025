import { Schema, model, Document } from "mongoose";

export interface IProject extends Document {
    name: string;
    organizationName: string;
    minStudents: number;
    maxStudents: number;
    groupName: string;
    professorId: string;
    urlToken: string;
    repoUrl: string;
    color?: string;
    students: string[]; // ✅ IMPORTANT
}

const projectSchema = new Schema<IProject>(
    {
        name: { type: String, required: true },
        organizationName: { type: String, required: true },
        minStudents: { type: Number, required: true },
        maxStudents: { type: Number, required: true },
        groupName: { type: String, required: true },
        professorId: { type: String, required: true },
        urlToken: { type: String, required: true },
        repoUrl: { type: String, required: true },
        color: { type: String, default: "#3b82f6" },
        students: { type: [String], default: [],},
    },
    { timestamps: true }
);

projectSchema.index(
    { professorId: 1, organizationName: 1, groupName: 1 },
    { unique: true }
);

export const Project = model<IProject>("Project", projectSchema);
