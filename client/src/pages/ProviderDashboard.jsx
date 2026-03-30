import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function ProviderDashboard() {
  const [requests, setRequests] = useState([]);
  const [profile, setProfile] = useState({ availability: false, location: { coordinates: [0, 0] } });
  const [locObj, setLocObj] = useState({ lng: 0, lat: 0, maxDistance: 10000 });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const res = await api.get('/users/profile');
    setProfile(res.data);
    setLocObj({
      ...locObj,
      lng: res.data.location?.coordinates[0] || 0,
      lat: res.data.location?.coordinates[1] || 0
    });
  };

  const updateProfile = async () => {
    try {
      await api.patch('/users/profile', {
        availability: profile.availability,
        location: { type: 'Point', coordinates: [locObj.lng, locObj.lat] }
      });
      alert('Profile Settings Saved!');
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  const fetchNearbyRequests = async () => {
    try {
      await updateProfile();
      const res = await api.get(`/jobs/nearby?lng=${locObj.lng}&lat=${locObj.lat}&maxDistance=${locObj.maxDistance}`);
      setRequests(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to fetch jobs.');
    }
  };

  const handleAcceptJob = async (id) => {
    try {
      await api.patch(`/jobs/${id}/accept`);
      alert('Job Accepted!');
      navigate('/history');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept job.');
    }
  };

  return (
    <div>
      <h2>Provider Dashboard</h2>
      
      <div className="card">
        <h3 className="card-title">My Availability & Location</h3>
        <p className="card-subtitle">Set your location to find nearby customers needing your skills.</p>
        
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ fontWeight: '500' }}>Accepting New Jobs?</label>
          <input 
            type="checkbox" 
            checked={profile.availability} 
            onChange={(e) => setProfile({...profile, availability: e.target.checked})} 
            style={{ width: '20px', height: '20px' }}
          />
        </div>

        <div className="grid">
          <div className="form-group">
            <label className="form-label">Longitude</label>
            <input type="number" step="0.01" className="form-input" value={locObj.lng} onChange={(e) => setLocObj({...locObj, lng: parseFloat(e.target.value)})} />
          </div>
          <div className="form-group">
            <label className="form-label">Latitude</label>
            <input type="number" step="0.01" className="form-input" value={locObj.lat} onChange={(e) => setLocObj({...locObj, lat: parseFloat(e.target.value)})} />
          </div>
          <div className="form-group">
            <label className="form-label">Search Radius (meters)</label>
            <select className="form-input" value={locObj.maxDistance} onChange={(e) => setLocObj({...locObj, maxDistance: parseInt(e.target.value)})}>
              <option value={5000}>5 km</option>
              <option value={10000}>10 km</option>
              <option value={20000}>20 km</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary" onClick={fetchNearbyRequests}>Search the Area for Jobs</button>
      </div>

      <h3 style={{ margin: '2rem 0 1rem 0' }}>Job Requests Near You</h3>
      {requests.length === 0 ? <p>No open jobs found. Try expanding your radius or wait for customers.</p> : (
        <div className="grid">
          {requests.map(req => (
            <div key={req._id} className="card" style={{ marginBottom: 0 }}>
              <h4 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{req.category}</h4>
              <p style={{ fontWeight: '600', color: 'var(--success)' }}>Budget: ${req.budget}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Requested by: {req.customer?.name}</p>
              
              <p style={{ marginBottom: '1.5rem', flex: 1 }}>{req.description}</p>
              
              <button className="btn btn-success" onClick={() => handleAcceptJob(req._id)} style={{ width: '100%' }}>
                Accept this Job
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProviderDashboard;
