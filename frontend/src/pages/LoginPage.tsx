import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const res = await api.post("/auth/login", { email, password });
            login(res.data.token);
            setSuccess("Connexion réussie !");

            setTimeout(() => {
                navigate("/dashboard");
            }, 800);
        } catch (err: any) {
            setError("Email ou MDP incorrect.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-semibold text-center mb-6">Connexion Professeur</h1>

                {error && <Alert type="error" message={error} />}
                {success && <Alert type="success" message={success} />}

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border p-2 rounded-md"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border p-2 rounded-md"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        Se Connecter
                    </button>
                </form>
            </div>
        </div>
    );
}
