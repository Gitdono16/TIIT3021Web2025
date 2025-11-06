import bcrypt from "bcrypt";
import { Professor } from "../models/Professor";
import { connectDB } from "./db";
import { encryptToken } from "../utils/crypto";

export async function initDatabase() {
    await connectDB();

    const existing = await Professor.find();
    if (existing.length > 0) {
        return;
    }

    const professors = [
        {
            email: process.env.PROF1_EMAIL!,
            password: process.env.PROF1_PASSWORD!,
            token: process.env.PROF1_GH_TOKEN!,
        },
        {
            email: process.env.PROF2_EMAIL!,
            password: process.env.PROF2_PASSWORD!,
            token: process.env.PROF2_GH_TOKEN!,
        },
    ];

    for (const p of professors) {
        const hashedPassword = await bcrypt.hash(p.password, 10);
        const enc = encryptToken(p.token);

        await Professor.create({
            email: p.email,
            password: hashedPassword,
            githubTokenIv: enc.iv,
            githubTokenData: enc.data,
            githubTokenTag: enc.tag,
        });
    }
}
