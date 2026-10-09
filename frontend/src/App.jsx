import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyJob from './pages/VerifyJob';
import History from './pages/History';
import ReportDetails from './pages/ReportDetails';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Awareness from './pages/Awareness';
import ProtectedRoute from './components/ProtectedRoute';

import AdminLayout from './pages/admin/AdminLayout';
import AdminReports from './pages/admin/AdminReports';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminScamIndicators from './pages/admin/AdminScamIndicators';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/verify"
          element={
            <ProtectedRoute>
              <VerifyJob />
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />

        <Route
          path="/history/:id"
          element={
            <ProtectedRoute>
              <ReportDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
              path="/profile"
              element={
                <ProtectedRoute>
              <Profile/>
                </ProtectedRoute>
            }
            />
          
        <Route
          path="awareness"
          element={
            <ProtectedRoute>
              <Awareness />
            </ProtectedRoute>
          }
        />


        {/* ADMIN ROUTES ------------ */}
        <Route path="/admin" element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
          }
        >
            <Route
                path="dashboard"
                element={<AdminDashboard />}
            />

            <Route
                path="users"
                element={<AdminUsers />}
            />

            <Route
                path="reports"
                element={<AdminReports />}
            />

            <Route
              path="companies"
              element={<AdminCompanies />}
            />

            <Route
              path="scam-indicators"
              element={<AdminScamIndicators />}
            />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;