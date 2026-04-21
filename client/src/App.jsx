import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import './App.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerLayout from './pages/CustomerLayout';
import CustomerHome from './pages/CustomerHome';
import CustomerSearch from './pages/CustomerSearch';
import CustomerConversations from './pages/CustomerConversations';
import CustomerProfile from './pages/CustomerProfile';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Chat from './pages/Chat';
import JobHistory from './pages/JobHistory';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />; // Redirect to home if not authorized
  }

  return children;
};

// Top Navbar
const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  if (!user || user.role === 'customer') return null; // Hide global navbar for customers

  return (
    <nav className="navbar">
      <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)', letterSpacing: '-0.5px' }}>NeighbOUR</div>
      <div className="nav-links">
        <a href="/">Dashboard</a>
        <a href="/history">My Jobs</a>
        <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>Hi, <strong>{user.name}</strong></span>
        <button onClick={logout} className="btn btn-secondary" style={{ marginLeft: '0.5rem', padding: '0.4rem 1rem', fontSize: '0.875rem' }}>Logout</button>
      </div>
    </nav>
  );
};

const DashboardRouter = () => {
    const { user, loading } = useContext(AuthContext);
    if(loading) return <div>Loading...</div>;
    if(!user) return <Navigate to="/login" />

    switch(user.role) {
        case 'customer': return <Navigate to="/customer" />;
        case 'provider': return <ProviderDashboard />;
        case 'admin': return <AdminDashboard />;
        default: return <Navigate to="/login" />;
    }
}

import { Outlet } from 'react-router-dom';

const ContainerLayout = () => (
  <div className="container">
    <Outlet />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div>
          <Routes>
            <Route element={<ContainerLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                   <DashboardRouter />
                </ProtectedRoute>
              } />

              <Route path="/history" element={
                <ProtectedRoute allowedRoles={['provider', 'admin']}>
                  <JobHistory />
                </ProtectedRoute>
              } />

              <Route path="/chat/:jobId" element={
                <ProtectedRoute allowedRoles={['customer', 'provider']}>
                  <Chat />
                </ProtectedRoute>
              } />
            </Route>

            {/* Customer Nested Routes - Full Width */}
            <Route path="/customer" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerLayout />
              </ProtectedRoute>
            }>
              <Route index element={<CustomerHome />} />
              <Route path="search" element={<CustomerSearch />} />
              <Route path="messages" element={<CustomerConversations />} />
              <Route path="history" element={<JobHistory />} />
              <Route path="profile" element={<CustomerProfile />} />
            </Route>

          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
