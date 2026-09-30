import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

function ProtectedRoute({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("access_token");
            setIsAuthenticated(!!token);
        };

        checkAuth();

        window.addEventListener("pageshow", checkAuth);

        return () => {
            window.removeEventListener("pageshow", checkAuth);
        };
    }, []);

    if (isAuthenticated === null) {
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;