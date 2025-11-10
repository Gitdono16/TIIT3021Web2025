import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import Alert from "../components/Alert";

export default function JoinProjectPage() {
    const { token } = useParams();
    const [project, setProject] = useState<any>(null);
    const [github, setGithub] = useState("");
    const [githubData, setGithubData] = useState<any>(null);
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await api.get(`/students/project/${token}`);
                setProject(res.data);
            } catch {
                setError("Lien invalide ou expiré.");
            }
        };
        fetchProject();
    }, [token]);

    const checkGithub = async () => {
        setGithubData(null);
        setError("");
        setChecking(true);

        try {
            const res = await api.get(`/students/github/${github}?token=${token}`);
            setGithubData(res.data);
        } catch {
            setError("Utilisateur GitHub introuvable.");
        }

        setChecking(false);
    };

    const register = async () => {
        if (!githubData) return;

        try {
            await api.post(`/students/join/${token}`, { github });
            setSuccess("Inscription réussie ✅");
        } catch (err: any) {
            setError(err.response?.data?.message || "Erreur lors de l'inscription!");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-14 bg-white p-6 rounded-xl shadow border">
            {error && <Alert type="error" message={error} />}
            {success && <Alert type="success" message={success} />}

            {!project && !success ? (
                <p className="text-center text-gray-600">Chargement...</p>
            ) : success ? (
                <h2 className="text-center text-green-600 text-xl font-semibold">
                    Vous êtes bien inscrit 🎉
                </h2>
            ) : (
                <>
                    <h1 className="text-xl font-bold text-center mb-2">
                        Inscription au projet : {project.name}
                    </h1>

                    <p className="text-center text-gray-600 mb-4">
                        Organisation : {project.organization} <br/>
                        Groupe : {project.groupName}
                    </p>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Pseudo GitHub"
                            className="border p-2 rounded w-full"
                            value={github}
                            onChange={(e) => setGithub(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={checkGithub}
                            disabled={checking}
                            className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-black"
                        >
                            {checking ? "..." : "Vérifier"}
                        </button>
                    </div>

                    {githubData && (
                        <div className="mt-4 flex items-center gap-3 p-3 border rounded bg-gray-50">
                            <img
                                src={githubData.avatar}
                                alt="avatar"
                                className="w-12 h-12 rounded-full border"
                            />
                            <div>
                                <p className="font-semibold">@{githubData.username}</p>
                                <a
                                    href={githubData.profile}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-700 underline text-sm"
                                >
                                    Voir le profil
                                </a>
                            </div>
                        </div>
                    )}

                    {githubData && (
                        <button
                            onClick={register}
                            className="w-full bg-blue-600 text-white py-2 mt-4 rounded hover:bg-blue-700"
                        >
                            Confirmer l'inscription
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
