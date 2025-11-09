import axios from "axios";

// ✅ Fallback si la variable n'est pas chargée
const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://tiit3021web2025.onrender.com/api";

const api = axios.create({
    baseURL: API_URL,
});

// ✅ Gestion erreurs + HashRouter
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            window.location.href = "/#/error";
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
