import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate

const Signup = () => {
  const navigate = useNavigate(); // Initialize navigate
  const [isHovered, setIsHovered] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validations = [
    { label: '8+ Characters', test: password.length >= 8 },
    { label: 'Uppercase', test: /[A-Z]/.test(password) },
    { label: 'Number', test: /[0-9]/.test(password) },
    { label: 'Special (!@#$)', test: /[!@#$%^&*]/.test(password) },
  ];

  const allValid = validations.every(v => v.test);

  // Function to handle navigation
  const handleCreateAccount = (e) => {
    e.preventDefault();
    if (allValid) {
      navigate('/'); // Navigates to Home
    }
  };

  const styles = {
    page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '80px 20px', fontFamily: "'Encode Sans Expanded', sans-serif" },
    formWrapper: { width: '100%', maxWidth: '500px', textAlign: 'center' },
    title: { fontFamily: "'Libre Baskerville', serif", color: '#112a3d', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', marginBottom: '10px' },
    subtitle: { color: '#112a3d', opacity: 0.7, fontSize: '1rem', marginBottom: '50px' },
    inputGroup: { textAlign: 'left', marginBottom: '25px', position: 'relative' },
    label: { display: 'block', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', color: '#112a3d', letterSpacing: '1.5px' },
    input: { width: '100%', padding: '15px 40px 15px 0', border: 'none', borderBottom: '2px solid #112a3d', background: 'transparent', outline: 'none', fontSize: '1.1rem', color: '#112a3d', fontWeight: '600' },
    toggleBtn: { position: 'absolute', right: '0', top: '42px', background: 'none', border: 'none', cursor: 'pointer', color: '#112a3d', opacity: 0.6 },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' },
    req: (met) => ({ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: '700', color: met ? '#2e7d32' : '#112a3d', opacity: met ? 1 : 0.4, transition: '0.3s' }),
    btn: { width: '100%', padding: '18px', backgroundColor: !allValid ? '#ccc' : (isHovered ? '#1a3d58' : '#112a3d'), color: '#f6f3eb', border: 'none', borderRadius: '50px', fontSize: '1rem', fontWeight: '800', cursor: allValid ? 'pointer' : 'not-allowed', transition: '0.3s', marginTop: '30px', textTransform: 'uppercase', letterSpacing: '2px' },
    footer: { marginTop: '40px', fontSize: '1rem', color: '#112a3d', fontWeight: '600' },
    link: { color: '#d1a67a', fontWeight: '800', textDecoration: 'none', marginLeft: '5px' }
  };

  return (
    <div style={styles.page}>
      <div style={styles.formWrapper}>
        <h1 style={styles.title}>Join Us</h1>
        <p style={styles.subtitle}>Create your sanctuary account</p>
        <form onSubmit={handleCreateAccount}>
          <div style={styles.inputGroup}><label style={styles.label}>Full Name</label><input type="text" style={styles.input} required /></div>
          <div style={styles.inputGroup}><label style={styles.label}>Email Address</label><input type="email" style={styles.input} required /></div>
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
            <div style={styles.grid}>
              {validations.map((v, i) => (
                <div key={i} style={styles.req(v.test)}>
                  {v.test ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg> : <div style={{width:6, height:6, borderRadius:'50%', background:'#112a3d'}}/>}
                  {v.label}
                </div>
              ))}
            </div>
          </div>
          <button 
            type="submit"
            disabled={!allValid}
            style={styles.btn}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Create Account
          </button>
        </form>
        <p style={styles.footer}>Already have an account? <Link to="/login" style={styles.link}>Login</Link></p>
      </div>
    </div>
  );
};

export default Signup;