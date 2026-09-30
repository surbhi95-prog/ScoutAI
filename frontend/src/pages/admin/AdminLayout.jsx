import { Outlet } from "react-router-dom";
import AdminNavbar from "../../components/admin/AdminNavbar";

function AdminLayout() {
    return (
        <>
            <AdminNavbar />
            <Outlet />
        </>
    );
}

export default AdminLayout;