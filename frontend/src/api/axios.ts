import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:3000/api",});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            if (window.location.pathname !== "/error") {
                window.location.href = "/error";
            }
            return Promise.reject(error);
        }

        const status = error.response.status;
        if (window.location.pathname === "/error") {
            return Promise.reject(error);
        }

        if (status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/error";
        } else if (status === 404) {
            window.location.href = "/error";
        } else if (status >= 500) {
            window.location.href = "/error";
        }

        return Promise.reject(error);
    }
);

export default api;
