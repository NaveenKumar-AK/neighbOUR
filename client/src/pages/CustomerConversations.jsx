import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function CustomerConversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        // Conversation list derived from jobs that are active (accepted)
        const res = await api.get('/jobs/history');
        const activeJobs = res.data.filter(j => j.status === 'accepted' || j.status === 'completed');
        // Sort by most recent
        activeJobs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setConversations(activeJobs);
      } catch (err) {
        console.error('Failed to fetch conversations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>Messages</h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading conversations...</div>
      ) : conversations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}><i className="bi bi-mailbox"></i></div>
          <p>No active conversations.</p>
          <button onClick={() => navigate('/customer')} className="btn btn-primary" style={{ marginTop: '1rem' }}>Find Providers</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {conversations.map(job => (
            <div 
              key={job._id} 
              onClick={() => navigate(`/chat/${job._id}`)}
              style={{
                display: 'flex', alignItems: 'center', padding: '1rem', background: 'var(--surface)', 
                borderRadius: '12px', cursor: 'pointer', border: '1px solid var(--border)',
                transition: 'background 0.2s',
                gap: '1rem'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
            >
              <div style={{
                width: '50px', height: '50px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 800, fontSize: '1.25rem'
              }}>
                {job.provider ? job.provider.name.charAt(0).toUpperCase() : '?'}
              </div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                  <h4 style={{ margin: 0, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {job.provider ? job.provider.name : 'Unknown Provider'}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(job.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Regarding: {job.category}
                  </p>
                  {job.status === 'completed' && <span className="badge status-completed" style={{transform: 'scale(0.8)', marginRight: 0}}>Completed</span>}
                </div>
              </div>
              
              <div style={{ color: 'var(--text-muted)' }}>
                 <i className="bi bi-chevron-right"></i>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomerConversations;
