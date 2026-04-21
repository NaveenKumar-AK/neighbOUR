import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

function CustomerLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/customer', label: 'Home', icon: 'bi-house' },
    { path: '/customer/search', label: 'Search', icon: 'bi-search' },
    { path: '/customer/messages', label: 'Messages', icon: 'bi-chat-dots' },
    { path: '/customer/history', label: 'History', icon: 'bi-clock-history' },
    { path: '/customer/profile', label: 'Profile', icon: 'bi-person' },
  ];

  return (
    <div className="customer-layout">
      {/* Top Header */}
      <div style={{ padding: '0.85rem 2rem', background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 600, fontSize: '1.2rem', color: 'var(--primary)', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center' }}>
          <i className="bi bi-houses-fill" style={{ marginRight: '0.4rem', fontSize: '1.25rem' }}></i> NeighbOUR
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <i className="bi bi-geo-alt"></i> Current Location
        </div>
      </div>

      <div style={{ padding: '2rem 1.5rem', width: '100%', boxSizing: 'border-box' }}>
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        {navItems.map(item => (
           <button
             key={item.path}
             className={`bottom-nav-item ${location.pathname === item.path ? 'active' : ''}`}
             onClick={() => navigate(item.path)}
           >
             <span className="icon"><i className={`bi ${item.icon}`}></i></span>
             <span>{item.label}</span>
           </button>
        ))}
      </nav>
    </div>
  );
}

export default CustomerLayout;
