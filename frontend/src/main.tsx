import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";


const redirect = sessionStorage.redirect;
if (redirect) {
    delete sessionStorage.redirect;
    window.history.replaceState(null, "", redirect);
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
