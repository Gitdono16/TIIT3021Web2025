import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert";

export default function CreateProjectPage() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [organizationName, setOrganizationName] = useState("");
    const [minStudents, setMinStudents] = useState(1);
    const [maxStudents, setMaxStudents] = useState(2);
    const [color, setColor] = useState("#3b82f6");
    const [nextGroup, setNextGroup] = useState<string | null>(null);
    const [orgMessage, setOrgMessage] = useState("");
    const [organizationValid, setOrganizationValid] = useState(false);
    const [loadingOrg, setLoadingOrg] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const verifyOrganization = async () => {
        setOrgMessage("");
        setNextGroup(null);
        setOrganizationValid(false);

        if (!organizationName.trim()) {
            setOrgMessage("Veuillez entrer une organisation.");
            return;
        }

        try {
            setLoadingOrg(true);

            const res = await api.get(
                `/projects/next-group?organizationName=${organizationName}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setNextGroup(res.data.nextGroup);
            setOrgMessage(`Organisation trouvée! Prochain N°groupe : ${res.data.nextGroup}`);
            setOrganizationValid(true);

        } catch {
            setOrganizationValid(false);
            setOrgMessage("Organisation introuvable sur GitHub.");
        }

        setLoadingOrg(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!organizationValid) {
            setError("Veuillez d’abord vérifier l’organisation.");
            return;
        }

        if (minStudents > maxStudents) {
            setError("min et max");
            return;
        }

        try {
            await api.post(
                "/projects",
                { name, organizationName, minStudents, maxStudents, color },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess("Projet créé avec succès !");
            setTimeout(() => navigate("/dashboard"), 600);
        } catch (err: any) {
            setError(err.response?.data?.message || "Erreur lors de la création.");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded-xl shadow border">
            <h1 className="text-xl font-semibold text-center mb-4">Créer un projet</h1>

            {error && <Alert type="error" message={error} />}
            {success && <Alert type="success" message={success} />}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">

                <input
                    type="text"
                    placeholder="Nom du projet"
                    className="border p-2 rounded"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                {/*Organisation + bouton de vérification */}
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Organisation GitHub"
                        className="border p-2 rounded w-full"
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        onClick={verifyOrganization}
                        disabled={loadingOrg}
                        className={`px-3 py-1 text-white rounded ${
                            loadingOrg ? "bg-gray-400" : "bg-gray-800 hover:bg-black"
                        }`}
                    >
                        {loadingOrg ? "..." : "Vérifier"}
                    </button>
                </div>

                {/*Message de validation organisation */}
                {orgMessage && (
                    <p className={`text-sm ${organizationValid ? "text-green-600" : "text-red-600"}`}>
                        {orgMessage}
                    </p>
                )}

                {/* Affichage visuel du prochain groupe */}
                {organizationValid && nextGroup && (
                    <div className="p-2 bg-blue-50 border border-blue-300 rounded text-blue-700 text-sm">
                         Prochain nom de groupe : <b>{nextGroup}</b>
                    </div>
                )}

                <input
                    type="number"
                    min={1}
                    placeholder="Min. étudiants"
                    className="border p-2 rounded"
                    value={minStudents}
                    onChange={(e) => setMinStudents(Number(e.target.value))}
                />

                <input
                    type="number"
                    min={1}
                    placeholder="Max. étudiants"
                    className="border p-2 rounded"
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(Number(e.target.value))}
                />

                <label className="text-sm font-medium">Couleur du projet :</label>
                <input
                    type="color"
                    className="w-16 h-10 border rounded cursor-pointer"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                />

                <button
                    type="submit"
                    disabled={!organizationValid}
                    className={`text-white py-2 rounded mt-3 transition ${
                        organizationValid
                            ? "bg-primary hover:bg-blue-600"
                            : "bg-gray-400 cursor-not-allowed"
                    }`}
                >
                    Créer le projet
                </button>
            </form>
        </div>
    );
}
