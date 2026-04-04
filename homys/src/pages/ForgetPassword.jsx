import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const ForgetPassword = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '80px 20px', fontFamily: "'Encode Sans Expanded', sans-serif" },
    formWrapper: { width: '100%', maxWidth: '450px', textAlign: 'center' },
    title: { fontFamily: "'Libre Baskerville', serif", color: '#112a3d', fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '20px' },
    text: { color: '#112a3d', opacity: 0.8, fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '40px', fontWeight: '500' },
    inputGroup: { textAlign: 'left', marginBottom: '40px' },
    label: { display: 'block', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '10px', color: '#112a3d', letterSpacing: '1.5px' },
    input: { width: '100%', padding: '15px 0', border: 'none', borderBottom: '2.5px solid #112a3d', background: 'transparent', outline: 'none', fontSize: '1.1rem', color: '#112a3d', fontWeight: '600' },
    btn: { width: '100%', padding: '20px', backgroundColor: !email || loading ? '#ccc' : (isHovered ? '#1a3d58' : '#112a3d'), color: '#f6f3eb', border: 'none', borderRadius: '50px', fontSize: '1rem', fontWeight: '800', cursor: email && !loading ? 'pointer' : 'not-allowed', transition: '0.3s', textTransform: 'uppercase', letterSpacing: '2px' },
    footer: { marginTop: '40px' },
    link: { color: '#112a3d', fontWeight: '800', textDecoration: 'none', borderBottom: '2px solid #112a3d' },
    success: { color: '#2e7d32', fontSize: '1rem', fontWeight: '700', padding: '16px', background: '#e8f5e9', borderRadius: '8px', marginBottom: '20px' },
    error: { color: '#c0392b', fontSize: '0.9rem', fontWeight: '700', padding: '12px', background: '#fdeaea', borderRadius: '8px', marginBottom: '20px' },
  };

  return (
    <div style={styles.page}>
      <div style={styles.formWrapper}>
        <h1 style={styles.title}>Reset Password</h1>
        {sent ? (
          <>
            <div style={styles.success}>✓ If an account with that email exists, a reset link has been sent. Check your inbox.</div>
            <div style={styles.footer}><Link to="/login" style={styles.link}>← Back to Login</Link></div>
          </>
        ) : (
          <>
            <p style={styles.text}>Enter your email and we'll send you instructions to reset your password.</p>
            <form onSubmit={handleSubmit}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <input type="email" style={styles.input} placeholder="name@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              {error && <div style={styles.error}>{error}</div>}
              <button 
                type="submit"
                disabled={!email || loading}
                style={styles.btn}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <div style={styles.footer}><Link to="/login" style={styles.link}>← Back to Login</Link></div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;