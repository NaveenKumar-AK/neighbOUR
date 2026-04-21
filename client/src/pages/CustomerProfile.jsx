import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function CustomerProfile() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return null;

  const MenuItem = ({ icon, label, onClick, badge }) => (
    <div 
      onClick={onClick}
      style={{ 
        padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', 
        alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
        transition: 'background 0.2s'
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <i className={`bi ${icon}`} style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}></i>
        <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {badge && <span className="badge" style={{ background: '#EEF2FF', color: 'var(--primary)' }}>{badge}</span>}
        <i className="bi bi-chevron-right" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}></i>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--text)' }}>
      {/* Header Profile Tag */}
      <div style={{ background: 'var(--surface)', padding: '2rem 1.5rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <div style={{
          width: '75px', height: '75px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: '2.5rem',
          boxShadow: '0 8px 16px rgba(11,60,93,0.15)'
        }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.35rem', fontWeight: 700 }}>{user.name}</h3>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.email || 'No email provided'}</p>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>{user.phone || '+91 98765 43210'}</p>
        </div>
        <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => alert('Edit profile implementation.')}>
          Edit
        </button>
      </div>

      {/* Account Settings */}
      <div style={{ marginBottom: '2rem' }}>
         <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '0.5rem', marginLeft: '0.5rem' }}>Account</h4>
         <div style={{ background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
           <MenuItem icon="bi-person-badge" label="Personal Information" onClick={() => alert('Personal details view.')} />
           <MenuItem icon="bi-geo-alt" label="Saved Addresses" onClick={() => alert('Manage locations view.')} badge="2" />
           <MenuItem icon="bi-credit-card" label="Payment Methods" onClick={() => alert('Payment details view.')} />
         </div>
      </div>

      {/* App Settings */}
      <div style={{ marginBottom: '2rem' }}>
         <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '0.5rem', marginLeft: '0.5rem' }}>Preferences</h4>
         <div style={{ background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
           <MenuItem icon="bi-bell" label="Notifications" onClick={() => alert('Notification settings.')} badge="On" />
           <MenuItem icon="bi-globe" label="Language" onClick={() => alert('Language selection.')} badge="English" />
           <MenuItem icon="bi-moon-stars" label="Dark Mode" onClick={() => alert('Theme toggle.')} />
         </div>
      </div>

      {/* Support Settings */}
      <div style={{ marginBottom: '2rem' }}>
         <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '0.5rem', marginLeft: '0.5rem' }}>Support & About</h4>
         <div style={{ background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
           <MenuItem icon="bi-question-circle" label="Help Center & FAQ" onClick={() => alert('Support portal.')} />
           <MenuItem icon="bi-shield-check" label="Privacy Policy" onClick={() => alert('Privacy Policy.')} />
           <MenuItem icon="bi-file-earmark-text" label="Terms of Service" onClick={() => alert('Terms of Service.')} />
         </div>
      </div>
      
      {/* Logout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem', marginBottom: '1rem' }}>
         <button className="btn btn-secondary" style={{ width: '100%', padding: '0.85rem', color: 'var(--danger)', borderColor: '#FECACA', background: '#FEF2F2' }} onClick={() => { logout(); navigate('/login'); }}>
           <i className="bi bi-box-arrow-right" style={{ marginRight: '0.5rem' }}></i> Logout Securely
         </button>
      </div>
    </div>
  );
}

export default CustomerProfile;
