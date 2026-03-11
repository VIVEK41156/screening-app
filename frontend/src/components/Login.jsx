import React, { useState } from 'react';
import { User, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@hr-tech.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#0a0a0c',
      fontFamily: '"Poppins", "Inter", sans-serif',
      color: '#ffffff',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Centered Glowing Card Container */}
      <div style={{
        margin: 'auto', // Ensures perfect centering in the flex container
        display: 'flex',
        width: '100%',
        maxWidth: '900px', // Medium card width
        height: '500px', // Fixed height for a balanced look
        backgroundColor: '#0a0a0c', // Dark internal background
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 0 30px 5px rgba(124, 58, 237, 0.3)', // Purple glow around the whole card
        border: '1px solid rgba(124, 58, 237, 0.5)', // Sharp glowing border
        zIndex: 2
      }}>

        {/* Right Side Diagonal Background Inside the Card */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: 'linear-gradient(135deg, #7e22ce 0%, #5b21b6 100%)',
          clipPath: 'polygon(45% 0, 100% 0, 100% 100%, 75% 100%)', // Adjusted slope to match the image
          zIndex: 0
        }}></div>

        {/* Thin purple border line along the diagonal inside the card */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: '-2px',
          background: '#a855f7',
          clipPath: 'polygon(45% 0, calc(45% + 2px) 0, calc(75% + 2px) 100%, 75% 100%)',
          zIndex: 1
        }}></div>

        {/* Left Side (Login Form) */}
        <div style={{
          flex: '0 0 50%', // More space for the form to match the diagonal
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '3rem',
          zIndex: 2
        }}>
          <div style={{ width: '100%', maxWidth: '320px' }}>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              marginBottom: '2.5rem',
              textAlign: 'center',
              letterSpacing: '1px'
            }}>Login</h1>

            {error && (
              <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>{error}</div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Username Input */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem', color: '#cbd5e1', fontWeight: '400' }}>Username</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #475569',
                    color: '#ffffff',
                    padding: '0.25rem 2rem 0.25rem 0',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderBottomColor = '#a855f7'}
                  onBlur={(e) => e.target.style.borderBottomColor = '#475569'}
                />
                <User style={{ position: 'absolute', right: 0, bottom: '0.25rem', color: '#cbd5e1' }} size={16} />
              </div>

              {/* Password Input */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem', color: '#cbd5e1', fontWeight: '400' }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #475569',
                    color: '#ffffff',
                    padding: '0.25rem 2rem 0.25rem 0',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'border-color 0.3s',
                    letterSpacing: '2px' // Dots for password
                  }}
                  onFocus={(e) => e.target.style.borderBottomColor = '#a855f7'}
                  onBlur={(e) => e.target.style.borderBottomColor = '#475569'}
                />
                <Lock style={{ position: 'absolute', right: 0, bottom: '0.25rem', color: '#cbd5e1' }} size={16} />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '9999px',
                  background: 'linear-gradient(90deg, #9333ea, #7e22ce)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  marginTop: '1rem',
                  boxShadow: '0 4px 10px rgba(147, 51, 234, 0.4)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseOver={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 15px rgba(147, 51, 234, 0.6)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 10px rgba(147, 51, 234, 0.4)';
                  }
                }}
              >
                {isLoading ? 'Authenticating...' : 'Login'}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', marginTop: '-0.5rem' }}>
                Dont have an account? <a href="#" style={{ color: '#a855f7', textDecoration: 'none', fontWeight: '400' }}>Sign Up</a>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side (Typing Animated Text) */}
        <div style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem',
          paddingLeft: '4rem',
          zIndex: 2
        }}>
          <TypewriterText />
        </div>

      </div>
    </div>
  );
};

// Creating a separate component for the looping typewriter effect
const TypewriterText = () => {
  const text = "Screen Before\nHire with\nSmart AI\nScreening";
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  React.useEffect(() => {
    let timeout;

    if (isTyping) {
      if (displayText.length < text.length) {
        timeout = setTimeout(() => {
          setDisplayText(text.slice(0, displayText.length + 1));
        }, 100); // Typing speed
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false); // Switch to deleting phase
        }, 2000); // Pause at the end before deleting
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 50); // Deletion speed (typically faster)
      } else {
        setIsTyping(true); // Switch back to typing phase
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, text]);

  // Split by newlines to render <br/> tags properly
  const lines = displayText.split('\n');

  return (
    <h1 style={{
      fontSize: '2rem', // Reduced font size
      fontWeight: '700', // Slightly lighter weight
      textAlign: 'center',
      lineHeight: '1.4',
      margin: 0,
      color: '#ffffff',
      textShadow: '0px 4px 15px rgba(0,0,0,0.3)',
      minHeight: '120px', // Prevents layout shift while typing
      display: 'inline-block'
    }}>
      {lines.map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        style={{ display: 'inline-block', width: '3px', height: '1.8rem', backgroundColor: '#a855f7', marginLeft: '4px', verticalAlign: 'middle' }}
      />
    </h1>
  );
};

export default Login;
