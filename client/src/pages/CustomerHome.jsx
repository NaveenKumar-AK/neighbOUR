import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SERVICE_CATEGORIES } from '../utils/constants';

function CustomerHome() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/customer/search?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/customer/search');
    }
  };

  return (
    <div>
      {/* HERO SEARCH BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
        padding: '3rem 2rem',
        textAlign: 'center',
        color: 'white',
        margin: '-2rem -1.5rem 2rem -1.5rem',
        borderBottom: '1px solid rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'white', letterSpacing: '-0.5px' }}>
          Find Trusted Locals
        </h1>
        <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.9)', marginBottom: '1.5rem' }}>
          Plumbers, tutors, electricians — around you.
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', color: 'var(--text-muted)' }}><i className="bi bi-search"></i></span>
            <input 
              type="text" 
              placeholder="Search by skill or name..." 
              value={query} 
              onChange={e => setQuery(e.target.value)}
              style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', borderRadius: '12px', border: 'none', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} 
            />
          </div>
          <button type="submit" className="btn btn-accent" style={{ padding: '0.875rem 1.5rem', borderRadius: '12px' }}>
            Search
          </button>
        </form>
      </div>

      {/* SERVICE CATEGORIES */}
      <div>
        <h2 style={{ marginBottom: '1.5rem', fontWeight: 600, letterSpacing: '-0.3px' }}>Service Categories</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.875rem' }}>
          {SERVICE_CATEGORIES.map(cat => (
            <button 
              key={cat.name} 
              onClick={() => navigate(`/customer/search?category=${encodeURIComponent(cat.name)}`)}
              style={{
                padding: '1.1rem 0.5rem', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.15s',
                border: '1.5px solid var(--border)', background: 'white',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 12px ${cat.iconColor}22`; e.currentTarget.style.borderColor = cat.iconColor; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{ background: cat.color, padding: '0.75rem', borderRadius: '50%', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: cat.iconColor }}>
                <i className={`bi ${cat.icon}`}></i>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CustomerHome;
