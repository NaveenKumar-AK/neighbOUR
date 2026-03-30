import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Auth.css';

function Register() {
  const [role, setRole] = useState('provider'); // Defaulting to provider based on user request focus
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', address: '',
    profilePhoto: '', skills: [], bio: '', 
    workingDays: [], workingHoursStart: '', workingHoursEnd: '', 
    availability: true, proofOfIdentity: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [availableSkills, setAvailableSkills] = useState(['Plumber', 'Electrician', 'Tutor', 'Cleaner', 'Carpenter', 'Mechanic', 'General Helper']);
  const [customSkill, setCustomSkill] = useState('');

  // Handle generalized text changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  // Handle multi-select for Working Days
  const handleDayToggle = (day) => {
    const updatedDays = formData.workingDays.includes(day)
      ? formData.workingDays.filter(d => d !== day)
      : [...formData.workingDays, day];
    
    setFormData({ ...formData, workingDays: updatedDays });
    if(errors.workingDays) setErrors({...errors, workingDays: null});
  };

  // Handle multi-select for Skills
  const handleSkillToggle = (skill) => {
    const updatedSkills = formData.skills.includes(skill)
      ? formData.skills.filter(s => s !== skill)
      : [...formData.skills, skill];
    
    setFormData({ ...formData, skills: updatedSkills });
    if(errors.skills) setErrors({...errors, skills: null});
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim()) {
      const newSkill = customSkill.trim();
      if (!availableSkills.includes(newSkill)) {
        setAvailableSkills([...availableSkills, newSkill]);
      }
      if (!formData.skills.includes(newSkill)) {
        setFormData({ ...formData, skills: [...formData.skills, newSkill] });
      }
      setCustomSkill('');
      if(errors.skills) setErrors({...errors, skills: null});
    }
  };

  // Turn files into Base64 (simple way to store images without Multer/S3)
  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setErrors({...errors, [fieldName]: 'File size must be less than 2MB'});
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [fieldName]: reader.result });
        if (errors[fieldName]) setErrors({ ...errors, [fieldName]: null });
      };
      reader.readAsDataURL(file);
    }
  };

  // Live Validation
  useEffect(() => {
    validateForm(false);
  }, [formData, role]);

  const validateForm = (isSubmit = true) => {
    let newErrors = {};
    let isValid = true;

    // Basic Info Validation
    if (!formData.name || formData.name.length < 3) {
      if(isSubmit) newErrors.name = "Full name must be at least 3 characters.";
      isValid = false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      if(isSubmit) newErrors.email = "Please enter a valid email address.";
      isValid = false;
    }
    if (!formData.password || formData.password.length < 6) {
      if(isSubmit) newErrors.password = "Password must be at least 6 characters long.";
      isValid = false;
    }
    const phoneRegex = /^\d{10}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      if(isSubmit) newErrors.phone = "Phone number must be exactly 10 digits.";
      isValid = false;
    }

    if (role === 'provider') {
      // Profile Details
      if (!formData.profilePhoto) {
        if(isSubmit) newErrors.profilePhoto = "Profile photo is required.";
        isValid = false;
      }
      if (formData.skills.length === 0) {
        if(isSubmit) newErrors.skills = "Please select at least one skill.";
        isValid = false;
      }
      
      // Work Details
      if (formData.workingDays.length === 0) {
        if(isSubmit) newErrors.workingDays = "Please select at least one working day.";
        isValid = false;
      }
      if (!formData.workingHoursStart) {
        if(isSubmit) newErrors.workingHoursStart = "Start time is required.";
        isValid = false;
      }
      if (!formData.workingHoursEnd) {
        if(isSubmit) newErrors.workingHoursEnd = "End time is required.";
        isValid = false;
      }
      if (formData.workingHoursStart && formData.workingHoursEnd && formData.workingHoursStart >= formData.workingHoursEnd) {
         if(isSubmit) newErrors.workingHoursEnd = "End time must be after Start time.";
         isValid = false;
      }
      
      // Verification
      if (!formData.proofOfIdentity) {
        if(isSubmit) newErrors.proofOfIdentity = "ID Proof is required.";
        isValid = false;
      }
    }

    if (isSubmit) {
      setErrors(newErrors);
    }
    return isValid;
  };

  const isFormValid = validateForm(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(true)) return;

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name, email: formData.email, 
        password: formData.password, phone: formData.phone,
        address: formData.address, role: role
      };

      if (role === 'provider') {
        payload.profilePhoto = formData.profilePhoto;
        payload.skills = formData.skills;
        payload.bio = formData.bio;
        payload.workingDays = formData.workingDays;
        payload.workingHours = { start: formData.workingHoursStart, end: formData.workingHoursEnd };
        payload.availability = formData.availability;
        payload.proofOfIdentity = formData.proofOfIdentity;
      }

      await api.post('/auth/register', payload);
      setIsSuccess(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      setErrors({ global: err.response?.data?.error || 'Registration failed.' });
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="auth-page-wrapper">
         <div className="card" style={{ maxWidth: '400px', margin: 'auto', textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '4rem', color: 'var(--success)'}}>✓</div>
            <h2>Registration Successful!</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem'}}>Welcome to NeighbOUR. You are now being redirected to the login page...</p>
         </div>
      </div>
    );
  }

  return (
    <div className="auth-page-wrapper" style={{ padding: '2rem 0' }}>
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto', border: 'none', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="brand-logo" style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>NeighbOUR</h1>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Create Your Account</h2>
          <p style={{ color: 'var(--text-muted)'}}>Join our community to connect with trusted locals.</p>
        </div>

        {errors.global && <div className="auth-alert fade-in">{errors.global}</div>}

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
          <button 
            type="button"
            className={`btn ${role === 'customer' ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setRole('customer')}
            style={{ padding: '0.75rem 2rem', borderRadius: '50px' }}
          >
            I Need a Service
          </button>
          <button 
            type="button"
            className={`btn ${role === 'provider' ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setRole('provider')}
            style={{ padding: '0.75rem 2rem', borderRadius: '50px' }}
          >
            I Provide a Service
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* SECTION 1: BASIC INFO */}
          <div style={{ background: 'var(--bg)', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', color: 'var(--text)'}}>1. Basic Information</h3>
            <div className="form-grid">
              
              <div className="input-group">
                <input type="text" name="name" id="name" className="modern-input" value={formData.name} onChange={handleChange} placeholder=" " />
                <label htmlFor="name" className="modern-label">Full Name *</label>
                {errors.name && <small style={{ color: 'var(--danger)', marginTop: '0.25rem', display: 'block' }}>{errors.name}</small>}
              </div>

              <div className="input-group">
                <input type="email" name="email" id="email" className="modern-input" value={formData.email} onChange={handleChange} placeholder=" " />
                <label htmlFor="email" className="modern-label">Email Address *</label>
                {errors.email && <small style={{ color: 'var(--danger)', marginTop: '0.25rem', display: 'block' }}>{errors.email}</small>}
              </div>

              <div className="input-group">
                <input type="password" name="password" id="password" className="modern-input" value={formData.password} onChange={handleChange} placeholder=" " />
                <label htmlFor="password" className="modern-label">Password *</label>
                {errors.password && <small style={{ color: 'var(--danger)', marginTop: '0.25rem', display: 'block' }}>{errors.password}</small>}
              </div>

              <div className="input-group">
                <input type="tel" name="phone" id="phone" className="modern-input" value={formData.phone} onChange={handleChange} placeholder=" " />
                <label htmlFor="phone" className="modern-label">Phone Number (10 digits) *</label>
                {errors.phone && <small style={{ color: 'var(--danger)', marginTop: '0.25rem', display: 'block' }}>{errors.phone}</small>}
              </div>

              <div className="input-group full-width">
                <input type="text" name="address" id="address" className="modern-input" value={formData.address} onChange={handleChange} placeholder=" " />
                <label htmlFor="address" className="modern-label">City / Exact Address</label>
              </div>

            </div>
          </div>

          {/* PROVIDER ONLY SECTIONS */}
          {role === 'provider' && (
            <>
              {/* SECTION 2: PROFILE DETAILS */}
              <div style={{ background: 'var(--bg)', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem'}}>2. Profile Details</h3>
                
                <div className="form-group">
                  <label className="form-label">Profile Photo (Image only) *</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {formData.profilePhoto && <img src={formData.profilePhoto} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />}
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'profilePhoto')} className="form-input" style={{ background: 'white' }} />
                  </div>
                  {errors.profilePhoto && <small style={{ color: 'var(--danger)', marginTop: '0.25rem', display: 'block' }}>{errors.profilePhoto}</small>}
                </div>

                <div className="form-group">
                  <label className="form-label">Skills (Select at least 1) *</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                    {availableSkills.map(skill => (
                      <button 
                        type="button" 
                        key={skill}
                        onClick={() => handleSkillToggle(skill)}
                        className={`badge ${formData.skills.includes(skill) ? 'status-open' : ''}`}
                        style={{ cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.9rem', border: formData.skills.includes(skill) ? '2px solid var(--primary)' : '1px solid var(--border)' }}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Other skill not listed?" 
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomSkill();
                        }
                      }}
                      style={{ maxWidth: '250px' }}
                    />
                    <button type="button" className="btn btn-secondary" onClick={handleAddCustomSkill} style={{ padding: '0.625rem 1rem' }}>Add</button>
                  </div>

                  {errors.skills && <small style={{ color: 'var(--danger)', marginTop: '0.25rem', display: 'block' }}>{errors.skills}</small>}
                </div>

                <div className="form-group">
                  <label className="form-label">Short Bio (Max 150 characters)</label>
                  <textarea name="bio" className="modern-input" maxLength="150" rows="3" value={formData.bio} onChange={handleChange} placeholder="Tell customers a bit about your experience..."></textarea>
                  <small style={{ color: 'var(--text-muted)'}}>{formData.bio.length}/150</small>
                </div>
              </div>

              {/* SECTION 3: WORK DETAILS */}
              <div style={{ background: 'var(--bg)', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem'}}>3. Work Details</h3>
                
                <div className="form-group">
                  <label className="form-label">Working Days *</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {daysOfWeek.map(day => (
                      <button 
                        type="button" 
                        key={day}
                        onClick={() => handleDayToggle(day)}
                        className={`badge ${formData.workingDays.includes(day) ? 'status-open' : ''}`}
                        style={{ cursor: 'pointer', padding: '0.35rem 0.75rem', border: formData.workingDays.includes(day) ? '2px solid var(--primary)' : '1px solid var(--border)' }}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                  {errors.workingDays && <small style={{ color: 'var(--danger)', marginTop: '0.25rem', display: 'block' }}>{errors.workingDays}</small>}
                </div>

                <div className="form-grid">
                  <div className="input-group">
                    <input type="time" name="workingHoursStart" id="workingHoursStart" className="modern-input" value={formData.workingHoursStart} onChange={handleChange} style={{paddingTop: '1.5rem'}}/>
                    <label htmlFor="workingHoursStart" className="modern-label" style={{top: '0.35rem', fontSize: '0.75rem', color: 'var(--primary)', transform: 'none'}}>Start Time *</label>
                    {errors.workingHoursStart && <small style={{ color: 'var(--danger)', marginTop: '0.25rem', display: 'block' }}>{errors.workingHoursStart}</small>}
                  </div>

                  <div className="input-group">
                    <input type="time" name="workingHoursEnd" id="workingHoursEnd" className="modern-input" value={formData.workingHoursEnd} onChange={handleChange} style={{paddingTop: '1.5rem'}}/>
                    <label htmlFor="workingHoursEnd" className="modern-label" style={{top: '0.35rem', fontSize: '0.75rem', color: 'var(--primary)', transform: 'none'}}>End Time *</label>
                    {errors.workingHoursEnd && <small style={{ color: 'var(--danger)', marginTop: '0.25rem', display: 'block' }}>{errors.workingHoursEnd}</small>}
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <label style={{ fontWeight: 600, flex: 1 }}>Available to take jobs immediately?</label>
                  <div 
                     onClick={() => setFormData({...formData, availability: !formData.availability})}
                     style={{
                        width: '50px', height: '26px', background: formData.availability ? 'var(--success)' : 'var(--border)', 
                        borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: '0.3s'
                     }}
                  >
                     <div style={{
                        width: '20px', height: '20px', background: 'white', borderRadius: '50%',
                        position: 'absolute', top: '3px', left: formData.availability ? '26px' : '4px', transition: '0.3s'
                     }}/>
                  </div>
                </div>
              </div>

              {/* SECTION 4: VERIFICATION */}
              <div style={{ background: 'var(--bg)', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem'}}>4. Verification</h3>
                
                <div className="form-group">
                  <label className="form-label">Upload ID Proof (Driver's License, Passport, etc.) *</label>
                  <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'proofOfIdentity')} className="form-input" style={{ background: 'white' }} />
                  {formData.proofOfIdentity && <small style={{color: 'var(--success)', marginTop: '0.5rem', display: 'block'}}>✓ Upload recorded successfully.</small>}
                  {errors.proofOfIdentity && <small style={{ color: 'var(--danger)', marginTop: '0.25rem', display: 'block' }}>{errors.proofOfIdentity}</small>}
                </div>
              </div>
            </>
          )}

          <button 
             type="submit" 
             className="modern-btn modern-btn-primary" 
             disabled={isSubmitting}
             style={{ padding: '1.25rem', fontSize: '1.1rem' }}
          >
            {isSubmitting ? 'Processing...' : (role === 'provider' ? 'Join NeighbOUR as a Provider' : 'Create Customer Account')}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
             <a href="/login" className="auth-link">Already have an account? Login here</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
