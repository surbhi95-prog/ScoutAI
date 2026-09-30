import { NavLink, useNavigate } from "react-router-dom";
import "./AdminNavbar.css";

function AdminNavbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_name");
        localStorage.removeItem("user_role");

        navigate("/login");
    };

    return (
        <nav className="admin-navbar">
            <div className="admin-navbar-brand">
                <span>ScoutAI</span>
                <small>Admin</small>
            </div>

            <div className="admin-navbar-links">
                
                <NavLink to="/admin/dashboard">
                    Dashboard
                </NavLink>

                <NavLink to="/admin/users">
                    Users
                </NavLink>

                <NavLink to="/admin/reports">
                    Reports
                </NavLink>

                <NavLink to="/admin/companies">
                    Companies
                </NavLink>
            </div>

            <button
                type="button"
                className="admin-logout-button"
                onClick={handleLogout}
            >
                Logout
            </button>
        </nav>
    );
}

export default AdminNavbar;
