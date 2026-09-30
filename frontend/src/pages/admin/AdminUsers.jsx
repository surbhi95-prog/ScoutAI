import { useEffect, useState } from "react";
import { getAdminUsers } from "../../services/api";
import "./AdminUsers.css";

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        try {
            const data = await getAdminUsers();
            setUsers(data);
        } catch (err) {
            setError("Failed to load users");
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="admin-users-page">
                <h1>Registered Users</h1>
                <p>Loading users...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-users-page">
                <h1>Registered Users</h1>
                <p className="error-message">{error}</p>
            </div>
        );
    }

    return (
        <div className="admin-users-page">
            <div className="users-header">
                <div>
                    <h1>Registered Users</h1>
                    <p>View users registered on ScoutAI.</p>
                </div>

                <span className="user-count">
                    {users.length} Users
                </span>
            </div>

            {users.length === 0 ? (
                <div className="empty-state">
                    <h3>No users found</h3>
                    <p>There are currently no registered users.</p>
                </div>
            ) : (
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Registered On</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>#{user.id}</td>

                                    <td className="user-name">
                                        {user.name}
                                    </td>

                                    <td>{user.email}</td>

                                    <td>
                                        <span
                                            className={`role-badge ${
                                                user.role === "admin"
                                                    ? "admin-role"
                                                    : "user-role"
                                            }`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>

                                    <td>
                                        {new Date(
                                            user.created_at
                                        ).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminUsers;