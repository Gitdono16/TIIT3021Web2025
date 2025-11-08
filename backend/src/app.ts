import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { json } from "body-parser";
import authRoutes from "./routes/authRoutes";
import projectRoutes from "./routes/projectRoutes";
import studentRoutes from "./routes/studentRoutes";
import githubRoutes from "./routes/githubRoutes";
import { Octokit } from "@octokit/rest";

dotenv.config();
const app = express();

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 300,
    })
);

const allowedOrigins = (process.env.CORS_ORIGINS || "").split(",").map(o => o.trim());

app.use(cors({
    origin: (origin, callback) => {
        // autorise les requêtes sans origin (ex: curl)
        if (!origin) return callback(null, true);

        // ✅ accepte si l’origin correspond
        if (allowedOrigins.some(o => origin.includes(o))) {
            console.log("CORS  ok ->", origin);
            return callback(null, true);
        }

        console.error("bloque CORS ->", origin);
        return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/github", githubRoutes);
app.get("/api/github/check-org/:org", async (req, res) => {
    const { org } = req.params;

    try {
        const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
        await octokit.orgs.get({ org });
        res.json({ exists: true });
    } catch (err: any) {
        if (err.status === 404) {
            return res.json({ exists: false });
        }
        console.error("Erreur GitHub :", err.message);
        res.status(500).json({ message: "Erreur GitHub" });
    }
});

app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
});

app.get("/", (_req, res) => {
    res.send("backend ok");
});

export default app;
