import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Encode Sans Expanded', sans-serif",
          background: '#f6f3eb', color: '#112a3d', padding: '40px 20px', textAlign: 'center',
        }}>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '2rem', marginBottom: 16 }}>
            Something went wrong
          </h1>
          <p style={{ opacity: 0.6, marginBottom: 32, maxWidth: 420, lineHeight: 1.6 }}>
            We hit an unexpected error. Please refresh the page or go back to the home page.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 32px', background: '#112a3d', color: '#f6f3eb',
                border: 'none', borderRadius: 50, cursor: 'pointer', fontWeight: 700,
                fontFamily: 'inherit', fontSize: '0.85rem', letterSpacing: '0.5px',
              }}
            >
              Refresh Page
            </button>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}
              style={{
                padding: '12px 32px', background: 'transparent', color: '#112a3d',
                border: '1.5px solid #112a3d', borderRadius: 50, cursor: 'pointer',
                fontWeight: 700, fontFamily: 'inherit', fontSize: '0.85rem', letterSpacing: '0.5px',
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
