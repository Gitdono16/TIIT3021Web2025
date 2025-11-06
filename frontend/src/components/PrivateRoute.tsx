import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface PrivateRouteProps {
    children: React.ReactNode;
}
export default function PrivateRoute({ children }: PrivateRouteProps) {
    const { token } = useAuth();

    if (!token) { return <Navigate to="/" replace />;}
    return <>{children}</>;
}
