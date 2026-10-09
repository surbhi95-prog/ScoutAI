import "./Navbar.css";
import { useState } from "react";
import { useNavigate,NavLink } from 'react-router-dom';
function Navbar() {
    const navigate = useNavigate();
    const [userName,setUserName] = useState(
        localStorage.getItem("user_name")
    );
    const handleLogout = () =>{
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_name");
        navigate('/login',{replace:true}); // diables forware button on browser -> so user does not again goes to other page using it
    };
    return (
        <nav className="navbar">

            <div className="navbar-logo"> 🛡️ ScoutAI </div>

            <div className="navbar-links">
                <NavLink to="/verify">Verify Job</NavLink>
                <NavLink to="/history">History</NavLink>
                <NavLink to="/dashboard">DashBoard</NavLink>
                <NavLink to="/awareness">Awareness</NavLink>
                <NavLink to="/profile">Profile</NavLink>
                
                <span className="navbar-user">
                    Hi, {userName}
                </span>

                <button
                    className="navbar-logout"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}
export default Navbar;