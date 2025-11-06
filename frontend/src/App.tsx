import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage.tsx";
import ProjectsPage from "./pages/ProjectsPage.tsx";
import CreateProjectPage from "./pages/CreateProjectPage.tsx";
import EditProjectPage from "./pages/EditProjectPage.tsx";
import JoinProjectPage from "./pages/JoinProjectPage.tsx";
import PrivateRoute from "./components/PrivateRoute";
import ErrorPage from "./pages/ErrorPage";

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Page de connexion */}
                    <Route path="/" element={<LoginPage />} />

                    {/* Routes protégées pour le professeur */}
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <ProjectsPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/create-project"
                        element={
                            <PrivateRoute>
                                <CreateProjectPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/edit-project/:id"
                        element={
                            <PrivateRoute>
                                <EditProjectPage />
                            </PrivateRoute>
                        }
                    />

                    {/* Page étudiants */}
                    <Route path="/join/:token" element={<JoinProjectPage />} />

                    {/* erreur*/}
                    <Route path="/error" element={<ErrorPage />} />
                    <Route path="*" element={<ErrorPage />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
