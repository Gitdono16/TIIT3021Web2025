import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
    githubUsername: string;
    projectId: mongoose.Types.ObjectId;
    createdAt: Date;
}
const studentSchema = new Schema<IStudent>(
    {
        githubUsername: {type: String, required: true, trim: true,
        },
        projectId: {type: Schema.Types.ObjectId, ref: "Project", required: true,
        },
    },
    {
        timestamps: true,
    }
);
// double inscription
studentSchema.index({ githubUsername: 1 }, { unique: true });
export const Student = mongoose.model<IStudent>("Student", studentSchema);
