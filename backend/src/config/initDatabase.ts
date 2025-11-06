import bcrypt from "bcrypt";
import { Professor } from "../models/Professor";
import { connectDB } from "./db";
import { encryptToken } from "../utils/crypto";

export async function initDatabase() {
    try {
        await connectDB();
        console.log("✅ MongoDB connecté");

        const existing = await Professor.countDocuments();
        if (existing > 0) {
            console.log("✅ Professors déjà existants, rien à créer");
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
            if (!p.email || !p.password || !p.token) {
                console.warn(`⚠️ Données manquantes dans .env pour ${p.email}`);
                continue;
            }

            const hashedPassword = await bcrypt.hash(p.password, 10);
            const enc = encryptToken(p.token);

            await Professor.create({
                email: p.email,
                password: hashedPassword,
                githubTokenIv: enc.iv,
                githubTokenData: enc.data,
                githubTokenTag: enc.tag,
            });

            console.log(`✅ Professeur créé : ${p.email}`);
        }

    } catch (err: any) {
        console.error("❌ Erreur initDatabase :", err.message);
        throw err; // important pour Render : il sait que le démarrage a échoué
    }
}
