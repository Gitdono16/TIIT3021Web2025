import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ErrorPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [errorCode, setErrorCode] = useState<number | null>(null);
    const [message, setMessage] = useState("");

    useEffect(() => { const state = location.state as { code?: number } | undefined;
        if (state?.code) {
            setErrorCode(state.code);
        }

        switch (state?.code) {
            case 401:
                setMessage("Vous devez être connecté pour rentrer sur cette page!");
                break;
            case 404:
                setMessage("La page que vous cherchez n’existe pas!");
                break;
            case 500:
                setMessage("Une erreur est survenue!");
                break;
            default:
                setMessage("Une erreur est survenue!");
        }
    }, [location.state]);

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 text-center p-6">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
                {errorCode || "Erreur"}
            </h1>
            <p className="text-lg text-gray-600 mb-8">{message}</p>

            <button
                onClick={() => navigate("/")}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
                Retour à l’accueil
            </button>
        </div>
    );
}
