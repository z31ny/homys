import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  const [isHovered, setIsHovered] = useState(false);

  const styles = {
    page: { 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: '80px 20px', 
      fontFamily: "'Encode Sans Expanded', sans-serif" 
    },
    formWrapper: { 
      width: '100%', 
      maxWidth: '450px', 
      textAlign: 'center' 
    },
    title: { 
      fontFamily: "'Libre Baskerville', serif", 
      color: '#112a3d', 
      fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', 
      marginBottom: '10px' 
    },
    subtitle: { 
      color: '#112a3d', 
      opacity: 0.7, 
      fontSize: '1rem', 
      marginBottom: '50px' 
    },
    inputGroup: { 
      textAlign: 'left', 
      marginBottom: '25px' 
    },
    label: { 
      display: 'block', 
      fontSize: '0.75rem', 
      fontWeight: '600', 
      textTransform: 'uppercase', 
      marginBottom: '10px', 
      color: '#112a3d', 
      letterSpacing: '1.5px' 
    },
    input: { 
      width: '100%', 
      padding: '15px 0', 
      border: 'none',
      borderBottom: '1.5px solid #112a3d', 
      background: 'transparent', 
      outline: 'none', 
      fontFamily: "'Encode Sans Expanded', sans-serif",
      fontSize: '1rem',
      color: '#112a3d'
    },
    forgot: { 
      display: 'block', 
      textAlign: 'right', 
      fontSize: '0.85rem', 
      color: '#112a3d', 
      textDecoration: 'none', 
      marginTop: '10px', 
      fontWeight: '500' 
    },
    btn: { 
      width: '100%', 
      padding: '18px', 
      backgroundColor: isHovered ? '#1a3d58' : '#112a3d', 
      color: '#f6f3eb', 
      border: 'none', 
      borderRadius: '50px', 
      fontSize: '1.1rem', 
      fontWeight: '600', 
      cursor: 'pointer', 
      transition: '0.3s', 
      marginTop: '40px', 
      textTransform: 'uppercase', 
      letterSpacing: '2px' 
    },
    footer: { 
      marginTop: '40px', 
      fontSize: '1rem', 
      color: '#112a3d' 
    },
    link: { 
      color: '#d1a67a', 
      fontWeight: '700', 
      textDecoration: 'none', 
      marginLeft: '5px' 
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.formWrapper}>
        <h1 style={styles.title}>Welcome</h1>
        <p style={styles.subtitle}>Log in to your Homys account</p>
        <form>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input type="email" style={styles.input} placeholder="name@email.com" />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input type="password" style={styles.input} placeholder="••••••••" />
            <Link to="/forget-password" style={styles.forgot}>Forgot Password?</Link>
          </div>
          <button 
            type="submit" 
            style={styles.btn}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Login
          </button>
        </form>
        <p style={styles.footer}>
          Don't have an account? <Link to="/signup" style={styles.link}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;