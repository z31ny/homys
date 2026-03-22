import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Signup = () => {
  const [isHovered, setIsHovered] = useState(false);

  const styles = {
    page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '80px 20px', fontFamily: "'Encode Sans Expanded', sans-serif" },
    formWrapper: { width: '100%', maxWidth: '500px', textAlign: 'center' },
    title: { fontFamily: "'Libre Baskerville', serif", color: '#112a3d', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', marginBottom: '10px' },
    subtitle: { color: '#112a3d', opacity: 0.7, fontSize: '1rem', marginBottom: '50px' },
    inputGroup: { textAlign: 'left', marginBottom: '20px' },
    label: { display: 'block', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px', color: '#112a3d', letterSpacing: '1.5px' },
    input: { width: '100%', padding: '15px 0', border: 'none', borderBottom: '1.5px solid #112a3d', background: 'transparent', outline: 'none', fontSize: '1rem' },
    btn: { width: '100%', padding: '18px', backgroundColor: isHovered ? '#1a3d58' : '#112a3d', color: '#f6f3eb', border: 'none', borderRadius: '50px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', transition: '0.3s', marginTop: '30px', textTransform: 'uppercase', letterSpacing: '2px' },
    footer: { marginTop: '40px', fontSize: '1rem', color: '#112a3d' },
    link: { color: '#d1a67a', fontWeight: '700', textDecoration: 'none', marginLeft: '5px' }
  };

  return (
    <div style={styles.page}>
      <div style={styles.formWrapper}>
        <h1 style={styles.title}>Join Us</h1>
        <p style={styles.subtitle}>Create your sanctuary account</p>
        <form>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input type="text" style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input type="email" style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input type="password" style={styles.input} />
          </div>
          <button 
            type="submit" 
            style={styles.btn}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Create Account
          </button>
        </form>
        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;