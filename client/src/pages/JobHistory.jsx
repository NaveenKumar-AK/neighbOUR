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

  return (
    <div>
      <h2>Job History</h2>
      
      {jobs.length === 0 ? <p>No job history available.</p> : (
        <div className="grid">
          {jobs.map(job => (
            <div key={job._id} className="card">
              <h4 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{job.category} - ${job.budget}</h4>
              <p className="card-subtitle">{new Date(job.createdAt).toLocaleDateString()}</p>
              
              <div style={{ marginBottom: '1rem' }}>
                <span className={`badge status-${job.status}`}>{job.status.toUpperCase()}</span>
              </div>
              
              {user.role === 'customer' && job.provider && (
                <p style={{marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  <strong>Provider:</strong> {job.provider.name}
                </p>
              )}
              {user.role === 'provider' && (
                <p style={{marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  <strong>Customer:</strong> {job.customer?.name}
                </p>
              )}
              
              <p style={{ flex: 1, marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{job.description}</p>
              
              <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                {job.status === 'accepted' && (
                  <button className="btn btn-primary" onClick={() => navigate(`/chat/${job._id}`)}>Open Chat / Negotiate</button>
                )}
                
                {job.status === 'accepted' && user.role === 'customer' && !ratingTarget && (
                  <button className="btn btn-success" onClick={() => setRatingTarget(job._id)}>
                    Mark Job Completed
                  </button>
                )}
              </div>
              
              {ratingTarget === job._id && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg)', borderRadius: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    Rate the Provider (1-5 Stars)
                  </label>
                  <input type="number" min="1" max="5" value={ratingVal} onChange={(e) => setRatingVal(parseInt(e.target.value))} className="form-input" style={{ marginBottom: '0.5rem' }} />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                     <button className="btn btn-success" onClick={() => handleComplete(job._id)} style={{ flex: 1 }}>Confirm</button>
                     <button className="btn btn-secondary" onClick={() => setRatingTarget(null)}>Cancel</button>
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
