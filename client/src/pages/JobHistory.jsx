import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

function JobHistory() {
  const [jobs, setJobs] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [ratingTarget, setRatingTarget] = useState(null);
  const [ratingVal, setRatingVal] = useState(5);

  const [activeTab, setActiveTab] = useState('All');

  const fetchHistory = async () => {
    try {
      const res = await api.get('/jobs/history');
      setJobs(res.data);
    } catch (err) {
      alert('Error fetching job history');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleComplete = async (jobId) => {
    try {
      await api.patch(`/jobs/${jobId}/complete`, { rating: ratingVal });
      alert('Job marked as completed and rated!');
      setRatingTarget(null);
      fetchHistory();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to complete job');
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Upcoming') return job.status === 'pending' || job.status === 'accepted';
    if (activeTab === 'Completed') return job.status === 'completed' || job.status === 'cancelled';
    return true;
  });

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>Job History</h2>
      
      <div className="tabs-container">
        {['All', 'Upcoming', 'Completed'].map(tab => (
           <button 
             key={tab} 
             className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
             onClick={() => setActiveTab(tab)}
           >
             {tab}
           </button>
        ))}
      </div>
      
      {filteredJobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
           <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}><i className="bi bi-clipboard-x"></i></div>
           <p>No jobs found in this category.</p>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100%, 1fr))' }}>
          {filteredJobs.map(job => (
            <div key={job._id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>{job.category}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                    {new Date(job.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge status-${job.status}`}>{job.status.toUpperCase()}</span>
                  <div style={{ fontWeight: 700, marginTop: '0.5rem', color: 'var(--primary)' }}>₹{job.budget}</div>
                </div>
              </div>
              
              <div style={{ background: 'var(--bg)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
                {user.role === 'customer' && job.provider && (
                  <p style={{margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>
                    <strong>Provider:</strong> {job.provider.name}
                  </p>
                )}
                {user.role === 'provider' && job.customer && (
                  <p style={{margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>
                    <strong>Customer:</strong> {job.customer.name}
                  </p>
                )}
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{job.description}</p>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 'auto' }}>
                {job.status === 'accepted' && (
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate(user.role === 'customer' ? '/customer/messages' : `/chat/${job._id}`)}>
                    <i className="bi bi-chat-dots"></i> Chat
                  </button>
                )}
                
                {job.status === 'accepted' && user.role === 'customer' && !ratingTarget && (
                  <button className="btn btn-success" style={{ flex: 1 }} onClick={() => setRatingTarget(job._id)}>
                    <i className="bi bi-check-circle"></i> Complete & Rate
                  </button>
                )}
              </div>
              
              {ratingTarget === job._id && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                    Rate the Provider (1-5 Stars)
                  </label>
                  <input type="number" min="1" max="5" value={ratingVal} onChange={(e) => setRatingVal(parseInt(e.target.value))} className="form-input" style={{ marginBottom: '0.75rem' }} />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                     <button className="btn btn-secondary" onClick={() => setRatingTarget(null)} style={{ flex: 1 }}>Cancel</button>
                     <button className="btn btn-success" onClick={() => handleComplete(job._id)} style={{ flex: 1 }}>Confirm</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default JobHistory;
