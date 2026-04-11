import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();
  const returnTo = location.state?.returnTo || '/profile';
  const [isHovered, setIsHovered] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(returnTo);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '80px 20px', fontFamily: "'Encode Sans Expanded', sans-serif" },
    formWrapper: { width: '100%', maxWidth: '450px', textAlign: 'center' },
    title: { fontFamily: "'Libre Baskerville', serif", color: '#112a3d', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', marginBottom: '10px' },
    subtitle: { color: '#112a3d', opacity: 0.7, fontSize: '1rem', marginBottom: '50px' },
    inputGroup: { textAlign: 'left', marginBottom: '25px', position: 'relative' },
    label: { display: 'block', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', color: '#112a3d', letterSpacing: '1.5px' },
    input: { width: '100%', padding: '15px 40px 15px 0', border: 'none', borderBottom: '2px solid #112a3d', background: 'transparent', outline: 'none', fontSize: '1.1rem', color: '#112a3d', fontWeight: '600' },
    toggleBtn: { position: 'absolute', right: '0', top: '42px' , background: 'none', border: 'none', cursor: 'pointer', color: '#112a3d', opacity: 0.6 },
    forgot: { display: 'block', textAlign: 'right', fontSize: '0.85rem', color: '#112a3d', textDecoration: 'none', marginTop: '10px', fontWeight: '700' },
    btn: { width: '100%', padding: '18px', backgroundColor: loading ? '#999' : (isHovered ? '#1a3d58' : '#112a3d'), color: '#f6f3eb', border: 'none', borderRadius: '50px', fontSize: '1rem', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer', transition: '0.3s', marginTop: '40px', textTransform: 'uppercase', letterSpacing: '2px' },
    footer: { marginTop: '40px', fontSize: '1rem', color: '#112a3d', fontWeight: '600' },
    link: { color: '#d1a67a', fontWeight: '800', textDecoration: 'none', marginLeft: '5px' },
    error: { color: '#c0392b', fontSize: '0.9rem', fontWeight: '700', marginTop: '15px', padding: '12px', background: '#fdeaea', borderRadius: '8px' },
  };

  return (
    <div style={styles.page}>
      <div style={styles.formWrapper}>
        <h1 style={styles.title}>Welcome</h1>
        <p style={styles.subtitle}>Log in to your Homys account</p>
        <form onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input type="email" style={styles.input} placeholder="name@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type={showPassword ? "text" : "password"} 
              style={styles.input} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" style={styles.toggleBtn} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
            </button>
            <Link to="/forget-password" style={styles.forgot}>Forgot Password?</Link>
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button 
            type="submit"
            disabled={loading}
            style={styles.btn}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={styles.footer}>Don't have an account? <Link to="/signup" style={styles.link}>Sign Up</Link></p>
      </div>
    </div>
  );
};

export default Login;