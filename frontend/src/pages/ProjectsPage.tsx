import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

type Project = {
    _id: string;
    name: string;
    organizationName: string;
    groupName: string;
    color?: string;
    urlToken: string;
    maxStudents: number;
    // selon la réponse API, on peut recevoir l’un ou l’autre
    students?: string[];
    studentCount?: number;
    // 🔹 lien prêt à l’emploi fourni par le backend
    studentLink: string;
};

export default function ProjectsPage() {
    const { token, logout } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await api.get("/projects", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProjects(res.data);
            } catch (err) {
                console.error("Erreur récupération projets :", err);
            }
        };
        if (token) fetchProjects();
    }, [token]);

    const copyJoinLink = (studentLink: string) => {
        navigator.clipboard.writeText(studentLink);
        alert("Lien étudiant copié !");
    };

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-semibold">Mes Projets</h1>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate("/create-project")}
                        className="text-sm px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                        + Nouveau projet
                    </button>

                    <button
                        onClick={logout}
                        className="text-sm px-3 py-2 border border-gray-400 rounded-md hover:bg-gray-100"
                    >
                        Déconnexion
                    </button>
                </div>
            </div>

            {projects.length === 0 ? (
                <p className="text-gray-500">C'est calme pour l'instant.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => {
                        const count =
                            project.studentCount ??
                            (Array.isArray(project.students) ? project.students.length : 0);
                        const ratio =
                            project.maxStudents > 0
                                ? Math.min(100, Math.round((count / project.maxStudents) * 100))
                                : 0;

                        return (
                            <div
                                key={project._id}
                                className="rounded-xl shadow-md border p-5 text-white"
                                style={{ backgroundColor: project.color || "#3b82f6" }}
                            >
                                <h2 className="text-xl font-semibold">{project.name}</h2>

                                <p className="text-sm mt-1">
                                    Organisation :{" "}
                                    <span className="font-medium">{project.organizationName}</span>
                                </p>

                                <p className="text-sm mt-1">
                                    Groupe : <span className="font-medium">{project.groupName}</span>
                                </p>

                                <div className="mt-3 text-md font-semibold">
                                    Étudiants : {count} / {project.maxStudents}
                                </div>

                                <div className="w-full bg-white/30 h-2 mt-1 rounded">
                                    <div
                                        className="h-2 rounded"
                                        style={{
                                            width: `${ratio}%`,
                                            background: "white",
                                        }}
                                    />
                                </div>

                                <div className="mt-4 flex flex-col gap-2">
                                    <button
                                        onClick={() =>
                                            window.open(
                                                `https://github.com/${project.organizationName}/${project.groupName}`,
                                                "_blank"
                                            )
                                        }
                                        className="px-3 py-1 text-sm bg-white/20 hover:bg-white/30 rounded"
                                    >
                                        Ouvrir repo GitHub
                                    </button>

                                    {/* 🔹 Utilise le lien renvoyé par l’API */}
                                    <button
                                        onClick={() => copyJoinLink(project.studentLink)}
                                        className="px-3 py-1 text-sm bg-white/20 hover:bg-white/30 rounded"
                                    >
                                        Copier lien étudiant
                                    </button>

                                    <button
                                        onClick={() => navigate(`/edit-project/${project._id}`)}
                                        className="px-3 py-1 text-sm bg-white/20 hover:bg-white/30 rounded"
                                    >
                                        Modifier
                                    </button>

                                    <button
                                        onClick={async () => {
                                            if (window.confirm("Supprimer ce projet ?")) {
                                                try {
                                                    await api.delete(`/projects/${project._id}`, {
                                                        headers: { Authorization: `Bearer ${token}` },
                                                    });
                                                    setProjects((prev) =>
                                                        prev.filter((p) => p._id !== project._id)
                                                    );
                                                } catch {
                                                    alert("Erreur lors de la suppression.");
                                                }
                                            }
                                        }}
                                        className="px-3 py-1 text-sm bg-red-500/80 hover:bg-red-500 rounded"
                                    >
                                        Supprimer
                                    </button>
                                </div>

                                <div className="mt-3 text-xs bg-white/15 rounded p-2 break-all">
                                    <span className="font-medium">URL étudiant :</span>{" "}
                                    {project.studentLink}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
