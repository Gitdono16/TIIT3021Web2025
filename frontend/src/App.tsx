import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import ProjectsPage from "./pages/ProjectsPage";
import CreateProjectPage from "./pages/CreateProjectPage";
import EditProjectPage from "./pages/EditProjectPage";
import JoinProjectPage from "./pages/JoinProjectPage";
import PrivateRoute from "./components/PrivateRoute";
import ErrorPage from "./pages/ErrorPage";

export default function App() {
    return (
        <HashRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<LoginPage />} />

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

                    <Route path="/join/:token" element={<JoinProjectPage />} />
                    <Route path="/error" element={<ErrorPage />} />
                    <Route path="*" element={<ErrorPage />} />
                </Routes>
            </AuthProvider>
        </HashRouter>
    );
}
