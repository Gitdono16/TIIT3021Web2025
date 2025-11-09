import axios from "axios";

// ✅ utilise bien ton backend Render
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// ✅ Gestion d'erreurs compatible avec GitHub Pages + HashRouter
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Pas de réponse du serveur → erreur serveur ou réseau
        if (!error.response) {
            if (window.location.hash !== "#/error") {
                window.location.href = "/#/error";
            }
            return Promise.reject(error);
        }

        const status = error.response.status;

        if (status === 401 || status === 404 || status >= 500) {
            window.location.href = "/#/error";
        }

        return Promise.reject(error);
    }
);

export default api;
