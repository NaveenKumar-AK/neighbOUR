import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

// Fix Leaflet broken default icon in Vite/bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Inner component to capture map clicks
function LocationPicker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}


const SERVICE_CATEGORIES = [
  { name: 'Plumbing',      emoji: '🔧', color: '#EEF2FF', iconColor: '#6366F1' },
  { name: 'Cleaning',      emoji: '✨', color: '#FDF4FF', iconColor: '#A855F7' },
  { name: 'Tutoring',      emoji: '🎓', color: '#F0FDF4', iconColor: '#22C55E' },
  { name: 'Electrical',    emoji: '⚡', color: '#FFFBEB', iconColor: '#F59E0B' },
  { name: 'Painting',      emoji: '🎨', color: '#FFF1F2', iconColor: '#F43F5E' },
  { name: 'Photography',   emoji: '📷', color: '#EFF6FF', iconColor: '#3B82F6' },
  { name: 'Driving',       emoji: '🚗', color: '#FFF7ED', iconColor: '#EF4444' },
  { name: 'Carpentry',     emoji: '🪚', color: '#ECFDF5', iconColor: '#10B981' },
  { name: 'Security',      emoji: '🛡️', color: '#F0FDF4', iconColor: '#16A34A' },
  { name: 'PC Repair',     emoji: '💻', color: '#EFF6FF', iconColor: '#2563EB' },
  { name: 'Gardening',     emoji: '🌿', color: '#F0FDF4', iconColor: '#15803D' },
  { name: 'Cooking',       emoji: '🍳', color: '#FFF7ED', iconColor: '#EA580C' },
  { name: 'Laundry',       emoji: '👕', color: '#EFF6FF', iconColor: '#0EA5E9' },
  { name: 'Baby Sitting',  emoji: '👶', color: '#FDF4FF', iconColor: '#D946EF' },
  { name: 'Pet Care',      emoji: '🐾', color: '#FFF7ED', iconColor: '#F97316' },
  { name: 'Moving Help',   emoji: '📦', color: '#FFFBEB', iconColor: '#CA8A04' },
  { name: 'AC Repair',     emoji: '❄️', color: '#EFF6FF', iconColor: '#38BDF8' },
  { name: 'Welding',       emoji: '🔩', color: '#F1F5F9', iconColor: '#64748B' },
  { name: 'Tailoring',     emoji: '🧵', color: '#FDF4FF', iconColor: '#C026D3' },
  { name: 'Yoga / Fitness',emoji: '🧘', color: '#F0FDF4', iconColor: '#4ADE80' },
  { name: 'Hair & Beauty', emoji: '💇', color: '#FFF1F2', iconColor: '#FB7185' },
  { name: 'Event Help',    emoji: '🎉', color: '#FFFBEB', iconColor: '#FBBF24' },
  { name: 'Delivery',      emoji: '🛵', color: '#FFF7ED', iconColor: '#F97316' },
  { name: 'Elder Care',    emoji: '🧓', color: '#F0FDF4', iconColor: '#059669' },
];

const RADIUS_OPTIONS = [
  { label: '5 km',  value: 5000  },
  { label: '10 km', value: 10000 },
  { label: '20 km', value: 20000 },
];

function CustomerDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery]   = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [locationInput, setLocationInput] = useState({ lat: '', lng: '' });
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [radius, setRadius]             = useState(5000);
  const [providers, setProviders]       = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hasSearched, setHasSearched]   = useState(false);

  // Booking modal state
  const [showRequestForm, setShowRequestForm] = useState(null);
  const [requestForm, setRequestForm]   = useState({ category: '', description: '', budget: '' });
  const [requestSent, setRequestSent]   = useState(false);

  const fetchProviders = async (lat, lng, dist) => {
    setLoadingProviders(true);
    setHasSearched(true);
    try {
      await api.patch('/users/profile', {
        location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] }
      });
      const res = await api.get(`/users/search-providers?lat=${lat}&lng=${lng}&maxDistance=${dist}`);
      setProviders(res.data);
    } catch {
      setProviders([]);
    } finally {
      setLoadingProviders(false);
    }
  };

  const handleSetLocation = () => {
    if (!locationInput.lat || !locationInput.lng) return;
    setLocationLabel(`Lat: ${parseFloat(locationInput.lat).toFixed(4)}, Lng: ${parseFloat(locationInput.lng).toFixed(4)}`);
    setShowLocationModal(false);
    fetchProviders(locationInput.lat, locationInput.lng, radius);
  };

  const filteredProviders = providers.filter(p => {
    const matchQuery = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCat = !selectedCategory ||
      p.skills?.some(s => s.toLowerCase().includes(selectedCategory.toLowerCase()));
    return matchQuery && matchCat;
  });

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/jobs', { ...requestForm, providerId: showRequestForm?._id });
      setRequestSent(true);
      setTimeout(() => {
        setShowRequestForm(null);
        setRequestSent(false);
        setRequestForm({ category: '', description: '', budget: '' });
        navigate('/history');
      }, 1800);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send request');
    }
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 64px)' }}>

      {/* HERO SEARCH BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
        padding: '3rem 2rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Find Trusted Locals Around You
        </h1>
        <p style={{ fontSize: '1.05rem', opacity: 0.9, marginBottom: '2rem' }}>
          Plumbers, tutors, electricians — all within your neighbourhood.
        </p>

        {/* Search + Location + Radius Row */}
        <div style={{ display: 'flex', gap: '0.75rem', maxWidth: '800px', margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' }}>🔍</span>
            <input type="text" placeholder="Search by skill or name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', borderRadius: '12px', border: 'none', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <button onClick={() => setShowLocationModal(true)} style={{
            padding: '0.875rem 1.25rem', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.5)',
            background: 'rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer', fontWeight: 600,
            fontSize: '0.9rem', backdropFilter: 'blur(8px)', whiteSpace: 'nowrap'
          }}>
            📍 {locationLabel || 'Set Location'}
          </button>

          <select value={radius} onChange={e => { setRadius(+e.target.value); if (locationInput.lat) fetchProviders(locationInput.lat, locationInput.lng, +e.target.value); }}
            style={{ padding: '0.875rem 1rem', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
            {RADIUS_OPTIONS.map(r => <option key={r.value} value={r.value} style={{ color: '#111' }}>{r.label}</option>)}
          </select>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

        {/* SERVICE CATEGORIES */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text)' }}>Service Categories</h2>
            {selectedCategory && (
              <button onClick={() => setSelectedCategory(null)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                ✕ Clear filter
              </button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.875rem' }}>
            {SERVICE_CATEGORIES.map(cat => (
              <button key={cat.name} onClick={() => setSelectedCategory(cat.name === selectedCategory ? null : cat.name)}
                style={{
                  padding: '1.1rem 0.5rem', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.15s',
                  border: selectedCategory === cat.name ? `2px solid ${cat.iconColor}` : '1.5px solid var(--border)',
                  background: selectedCategory === cat.name ? cat.color : 'white',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                  boxShadow: selectedCategory === cat.name ? `0 0 0 3px ${cat.iconColor}22` : '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                <span style={{ fontSize: '1.75rem' }}>{cat.emoji}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: selectedCategory === cat.name ? cat.iconColor : 'var(--text-muted)' }}>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* PROVIDERS SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text)' }}>
            {hasSearched ? `Providers Near You ${filteredProviders.length > 0 ? `(${filteredProviders.length})` : ''}` : 'Providers Near You'}
          </h2>
          {!locationLabel && (
            <button onClick={() => setShowLocationModal(true)} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
              📍 Set Location to Search
            </button>
          )}
        </div>

        {loadingProviders && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
            <p>Finding nearby providers...</p>
          </div>
        )}

        {!loadingProviders && !hasSearched && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', background: 'white', borderRadius: '16px', border: '1.5px dashed var(--border)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)' }}>Set your location first</h3>
            <p style={{ fontSize: '0.95rem', marginBottom: '1.5rem' }}>We need your coordinates to find trusted providers near you.</p>
            <button onClick={() => setShowLocationModal(true)} className="btn btn-primary">Set My Location</button>
          </div>
        )}

        {!loadingProviders && hasSearched && filteredProviders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', background: 'white', borderRadius: '16px', border: '1.5px dashed var(--border)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)' }}>No providers found</h3>
            <p style={{ fontSize: '0.95rem' }}>Try increasing your radius or a different location.</p>
          </div>
        )}

        {/* PROVIDER GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {filteredProviders.map(p => (
            <div key={p._id} style={{
              background: 'white', borderRadius: '16px', border: '1.5px solid var(--border)',
              padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              transition: 'transform 0.15s, box-shadow 0.15s'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.09)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
            >
              {/* Provider Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 800, fontSize: '1.25rem'
                }}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)' }}>{p.name}</span>
                    {p.availability && <span style={{ background: '#DCFCE7', color: '#16A34A', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '20px' }}>Available</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                    <span style={{ color: '#F59E0B' }}>★</span>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.rating?.toFixed(1) || '0.0'}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>· {p.jobsCompleted || 0} jobs</span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                {(p.skills?.length > 0 ? p.skills.slice(0, 3) : ['General Helper']).map(s => (
                  <span key={s} style={{ background: '#FFF7ED', color: 'var(--primary)', border: '1px solid #FED7AA', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>{s}</span>
                ))}
                {p.skills?.length > 3 && <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', alignSelf: 'center' }}>+{p.skills.length - 3} more</span>}
              </div>

              {/* Bio */}
              {p.bio && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>{p.bio}</p>}

              {/* Work timing */}
              {p.workingHours?.start && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  🕐 {p.workingHours.start} – {p.workingHours.end}
                  {p.workingDays?.length > 0 && ` · ${p.workingDays.slice(0,3).join(', ')}`}
                </p>
              )}

              {/* CTA */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setShowRequestForm(p)} style={{
                  flex: 1, padding: '0.7rem', background: 'var(--primary)', color: 'white',
                  border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem'
                }}>
                  Book Now
                </button>
                <button onClick={() => navigate('/history')} style={{
                  padding: '0.7rem 1rem', background: 'var(--bg)', color: 'var(--text-muted)',
                  border: '1.5px solid var(--border)', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem'
                }}>
                  💬
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LOCATION MODAL — Interactive Map */}
      {showLocationModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', maxWidth: '620px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '0.35rem', fontSize: '1.2rem' }}>📍 Set Your Location</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Click anywhere on the map to place a pin, or use your GPS.
            </p>

            {/* GPS button */}
            <button
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(pos => {
                    setLocationInput({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                  }, () => alert('GPS access denied. Please click the map instead.'));
                }
              }}
              style={{ width: '100%', marginBottom: '1rem', padding: '0.65rem', border: '1.5px solid var(--border)', borderRadius: '10px', background: '#F0FDF4', color: '#15803D', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
            >
              🎯 Use My Current GPS Location
            </button>

            {/* Map */}
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1.5px solid var(--border)', height: '300px', marginBottom: '1rem' }}>
              <MapContainer
                center={locationInput.lat ? [locationInput.lat, locationInput.lng] : [20.5937, 78.9629]}
                zoom={locationInput.lat ? 13 : 5}
                style={{ height: '100%', width: '100%' }}
                key={locationInput.lat + locationInput.lng}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
                />
                <LocationPicker onPick={(lat, lng) => setLocationInput({ lat: lat.toFixed(6), lng: lng.toFixed(6) })} />
                {locationInput.lat && locationInput.lng && (
                  <Marker position={[parseFloat(locationInput.lat), parseFloat(locationInput.lng)]} />
                )}
              </MapContainer>
            </div>

            {/* Coordinates display */}
            {locationInput.lat && locationInput.lng ? (
              <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#92400E', fontWeight: 500 }}>
                📌 Selected: <strong>Lat {parseFloat(locationInput.lat).toFixed(5)}, Lng {parseFloat(locationInput.lng).toFixed(5)}</strong>
              </div>
            ) : (
              <div style={{ background: '#F9FAFB', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                👆 No location selected yet. Click the map or use GPS above.
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setShowLocationModal(false)} style={{ flex: 1, padding: '0.825rem', border: '1.5px solid var(--border)', borderRadius: '10px', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={handleSetLocation} disabled={!locationInput.lat || !locationInput.lng}
                style={{ flex: 1, padding: '0.825rem', border: 'none', borderRadius: '10px', background: locationInput.lat ? 'var(--primary)' : '#D1D5DB', color: 'white', cursor: locationInput.lat ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '0.95rem' }}>
                Confirm & Search Providers
              </button>
            </div>
          </div>
        </div>
      )}


      {/* BOOKING MODAL */}
      {showRequestForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', maxWidth: '480px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
            {requestSent ? (
              <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ fontSize: '3.5rem', color: 'var(--success)', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Request Sent!</h3>
                <p style={{ color: 'var(--text-muted)' }}>Redirecting to your job history...</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>
                    {showRequestForm.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.15rem', margin: 0 }}>Book {showRequestForm.name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>{showRequestForm.skills?.[0] || 'Service Provider'}</p>
                  </div>
                </div>
                <form onSubmit={handleCreateRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Service Category *</label>
                    <select value={requestForm.category} onChange={e => setRequestForm({...requestForm, category: e.target.value})} required
                      style={{ width: '100%', padding: '0.75rem', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '0.9rem', outline: 'none' }}>
                      <option value="">Select Category</option>
                      {SERVICE_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Budget (₹) *</label>
                    <input type="number" placeholder="e.g. 500" value={requestForm.budget} onChange={e => setRequestForm({...requestForm, budget: e.target.value})} required
                      style={{ width: '100%', padding: '0.75rem', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Describe the Job *</label>
                    <textarea placeholder="What needs to be done? Any specific requirements?" rows={3} value={requestForm.description} onChange={e => setRequestForm({...requestForm, description: e.target.value})} required
                      style={{ width: '100%', padding: '0.75rem', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button type="button" onClick={() => setShowRequestForm(null)} style={{ flex: 1, padding: '0.825rem', border: '1.5px solid var(--border)', borderRadius: '10px', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                    <button type="submit" style={{ flex: 2, padding: '0.825rem', border: 'none', borderRadius: '10px', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' }}>
                      Send Request 🚀
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;
