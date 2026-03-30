import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgetPassword = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [email, setEmail] = useState('');

  const styles = {
    page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '80px 20px', fontFamily: "'Encode Sans Expanded', sans-serif" },
    formWrapper: { width: '100%', maxWidth: '450px', textAlign: 'center' },
    title: { fontFamily: "'Libre Baskerville', serif", color: '#112a3d', fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '20px' },
    text: { color: '#112a3d', opacity: 0.8, fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '40px', fontWeight: '500' },
    inputGroup: { textAlign: 'left', marginBottom: '40px' },
    label: { display: 'block', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '10px', color: '#112a3d', letterSpacing: '1.5px' },
    input: { width: '100%', padding: '15px 0', border: 'none', borderBottom: '2.5px solid #112a3d', background: 'transparent', outline: 'none', fontSize: '1.1rem', color: '#112a3d', fontWeight: '600' },
    btn: { width: '100%', padding: '20px', backgroundColor: !email ? '#ccc' : (isHovered ? '#1a3d58' : '#112a3d'), color: '#f6f3eb', border: 'none', borderRadius: '50px', fontSize: '1rem', fontWeight: '800', cursor: email ? 'pointer' : 'not-allowed', transition: '0.3s', textTransform: 'uppercase', letterSpacing: '2px' },
    footer: { marginTop: '40px' },
    link: { color: '#112a3d', fontWeight: '800', textDecoration: 'none', borderBottom: '2px solid #112a3d' }
  };

  return (
    <div style={styles.page}>
      <div style={styles.formWrapper}>
        <h1 style={styles.title}>Reset Password</h1>
        <p style={styles.text}>Enter your email and we'll send you instructions to reset your password.</p>
        <form onSubmit={(e) => e.preventDefault()}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input type="email" style={styles.input} placeholder="name@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button 
            disabled={!email}
            style={styles.btn}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Send Reset Link
          </button>
        </form>
        <div style={styles.footer}><Link to="/login" style={styles.link}>← Back to Login</Link></div>
      </div>
    </div>
  );
};

export default ForgetPassword;