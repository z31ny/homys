import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const validations = [
    { label: '8+ Characters', test: password.length >= 8 },
    { label: 'Uppercase', test: /[A-Z]/.test(password) },
    { label: 'Number', test: /[0-9]/.test(password) },
    { label: 'Special (!@#$)', test: /[!@#$%^&*]/.test(password) },
  ];

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const allValid = validations.every(v => v.test) && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allValid) return;
    setError('');
    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '80px 20px', fontFamily: "'Encode Sans Expanded', sans-serif" },
    formWrapper: { width: '100%', maxWidth: '450px', textAlign: 'center' },
    title: { fontFamily: "'Libre Baskerville', serif", color: '#112a3d', fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '20px' },
    text: { color: '#112a3d', opacity: 0.8, fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '40px', fontWeight: '500' },
    inputGroup: { textAlign: 'left', marginBottom: '25px', position: 'relative' },
    label: { display: 'block', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '10px', color: '#112a3d', letterSpacing: '1.5px' },
    input: { width: '100%', padding: '15px 40px 15px 0', border: 'none', borderBottom: '2.5px solid #112a3d', background: 'transparent', outline: 'none', fontSize: '1.1rem', color: '#112a3d', fontWeight: '600' },
    toggleBtn: { position: 'absolute', right: '0', top: '42px', background: 'none', border: 'none', cursor: 'pointer', color: '#112a3d', opacity: 0.6 },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' },
    req: (met) => ({ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: '700', color: met ? '#2e7d32' : '#112a3d', opacity: met ? 1 : 0.4, transition: '0.3s' }),
    matchIndicator: (match) => ({ fontSize: '0.75rem', fontWeight: '700', color: match ? '#2e7d32' : '#c0392b', opacity: confirmPassword.length > 0 ? 1 : 0, transition: '0.3s', marginTop: '8px' }),
    btn: { width: '100%', padding: '20px', backgroundColor: !allValid || loading ? '#ccc' : (isHovered ? '#1a3d58' : '#112a3d'), color: '#f6f3eb', border: 'none', borderRadius: '50px', fontSize: '1rem', fontWeight: '800', cursor: allValid && !loading ? 'pointer' : 'not-allowed', transition: '0.3s', marginTop: '30px', textTransform: 'uppercase', letterSpacing: '2px' },
    footer: { marginTop: '40px' },
    link: { color: '#112a3d', fontWeight: '800', textDecoration: 'none', borderBottom: '2px solid #112a3d' },
    success: { color: '#2e7d32', fontSize: '1rem', fontWeight: '700', padding: '16px', background: '#e8f5e9', borderRadius: '8px', marginBottom: '20px' },
    error: { color: '#c0392b', fontSize: '0.9rem', fontWeight: '700', padding: '12px', background: '#fdeaea', borderRadius: '8px', marginBottom: '20px' },
    invalidToken: { color: '#c0392b', fontSize: '1rem', fontWeight: '600', padding: '24px', background: '#fdeaea', borderRadius: '12px', marginBottom: '30px' },
  };

  if (!token) {
    return (
      <div style={styles.page}>
        <div style={styles.formWrapper}>
          <h1 style={styles.title}>Invalid Link</h1>
          <div style={styles.invalidToken}>
            This password reset link is invalid or incomplete. Please request a new one.
          </div>
          <div style={styles.footer}>
            <Link to="/forget-password" style={styles.link}>Request New Reset Link</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.formWrapper}>
        <h1 style={styles.title}>New Password</h1>
        {success ? (
          <>
            <div style={styles.success}>✓ Your password has been reset successfully!</div>
            <button
              style={{ ...styles.btn, backgroundColor: isHovered ? '#1a3d58' : '#112a3d', cursor: 'pointer' }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => navigate('/login')}
            >
              Go to Login
            </button>
          </>
        ) : (
          <>
            <p style={styles.text}>Enter your new password below. It must meet the same security requirements as when you created your account.</p>
            <form onSubmit={handleSubmit}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  style={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" style={styles.toggleBtn} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ?
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" /></svg>
                    :
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </button>
                <div style={styles.grid}>
                  {validations.map((v, i) => (
                    <div key={i} style={styles.req(v.test)}>
                      {v.test ?
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>
                        :
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#112a3d' }} />
                      }
                      {v.label}
                    </div>
                  ))}
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  style={styles.input}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <div style={styles.matchIndicator(passwordsMatch)}>
                  {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </div>
              </div>
              {error && <div style={styles.error}>{error}</div>}
              <button
                type="submit"
                disabled={!allValid || loading}
                style={styles.btn}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {loading ? 'Resetting...' : 'Set New Password'}
              </button>
            </form>
            <div style={styles.footer}><Link to="/login" style={styles.link}>← Back to Login</Link></div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
