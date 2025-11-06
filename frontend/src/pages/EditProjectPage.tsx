import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";
//
export default function EditProjectPage() {
    const { token } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState<any>(null);
    const [name, setName] = useState("");
    const [organizationName, setOrganizationName] = useState("");
    const [minStudents, setMinStudents] = useState(1);
    const [maxStudents, setMaxStudents] = useState(2);
    const [color, setColor] = useState("#3b82f6");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await api.get(`/projects/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProject(res.data);
                setName(res.data.name);
                setOrganizationName(res.data.organizationName);
                setMinStudents(res.data.minStudents);
                setMaxStudents(res.data.maxStudents);
                setColor(res.data.color || "#3b82f6");
            } catch {
                setError("Projet introuvable");
            }
        };
        fetchProject();
    }, [id, token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            await api.put(
                `/projects/${id}`,
                { name, organizationName, minStudents, maxStudents, color },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess("Modifications enregistrées !");
            setTimeout(() => navigate("/dashboard"), 800);
        } catch {
            setError("Erreur lors de la mise à jour");
        }
    };

    if (!project) return <p className="text-center mt-10">Chargement...</p>;

    return (
        <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded-xl shadow border">
            <h1 className="text-xl font-semibold text-center mb-4">Modifier le projet</h1>

            {error && <Alert type="error" message={error} />}
            {success && <Alert type="success" message={success} />}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">

                <input
                    type="text"
                    className="border p-2 rounded"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    type="text"
                    className="border p-2 rounded"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                />

                <input
                    type="number"
                    min={1}
                    className="border p-2 rounded"
                    value={minStudents}
                    onChange={(e) => setMinStudents(Number(e.target.value))}
                />

                <input
                    type="number"
                    min={1}
                    className="border p-2 rounded"
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(Number(e.target.value))}
                />

                {/* Sélecteur de couleur */}
                <label className="text-sm font-medium">Couleur du projet :</label>
                <input
                    type="color"
                    className="w-16 h-10 border rounded cursor-pointer"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                />

                <button
                    type="submit"
                    className="bg-primary text-white py-2 rounded mt-3 hover:bg-blue-600 transition"
                >
                    Sauvegarder
                </button>
            </form>
        </div>
    );
}
