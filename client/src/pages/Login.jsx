import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import './Auth.css'; // Let's create a separate CSS file for these modern auth pages

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-glass-panel">
        <div className="auth-left-decor">
          <div className="decor-content">
            <h1 className="brand-logo">NeighbOUR</h1>
            <p className="decor-subtitle">Connect with trusted local professionals around you instantly.</p>
          </div>
        </div>
        
        <div className="auth-form-container">
          <div className="auth-form-inner">
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Please enter your details to sign in.</p>
            
            {error && <div className="auth-alert fade-in">{error}</div>}
            
            <form onSubmit={handleSubmit} className="modern-form">
              <div className="input-group">
                <input 
                  type="email" 
                  id="email"
                  className="modern-input" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder=" "
                  required 
                />
                <label htmlFor="email" className="modern-label">Email Address</label>
              </div>
              
              <div className="input-group">
                <input 
                  type="password" 
                  id="password"
                  className="modern-input" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder=" "
                  required 
                />
                <label htmlFor="password" className="modern-label">Password</label>
              </div>
              
              <button type="submit" className="modern-btn modern-btn-primary" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            
            <p className="auth-footer-text">
              Don't have an account? <a href="/register" className="auth-link">Create an account</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
