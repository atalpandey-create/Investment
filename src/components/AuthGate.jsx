import React, { useState } from 'react';
import { Mail, Lock, User, ShieldAlert, Sparkles, CheckCircle2, ArrowLeft } from 'lucide-react';

const AuthGate = ({ onLoginSuccess }) => {
  const [activeView, setActiveView] = useState('login'); // 'login', 'signup', 'forgot', 'verify'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSimulatedSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    if (activeView === 'login') {
      setLoadingMsg('Authenticating secure credentials...');
      setTimeout(() => {
        setIsLoading(false);
        const demoUser = {
          name: email.split('@')[0].toUpperCase(),
          email: email,
          avatarText: email[0].toUpperCase()
        };
        onLoginSuccess(demoUser);
      }, 1500);
    } else if (activeView === 'signup') {
      setLoadingMsg('Registering profile details...');
      setTimeout(() => {
        setIsLoading(false);
        setActiveView('verify');
        setSuccessMsg(`A 6-digit verification code has been dispatched to ${email}.`);
      }, 1500);
    } else if (activeView === 'forgot') {
      setLoadingMsg('Locating profile registry and dispatching reset secure token...');
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMsg(`Recovery link has been dispatched successfully! Verify your inbox at ${email}.`);
      }, 2000);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      setErrorMsg('Verification code must contain 6 numerical digits.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    setLoadingMsg('Validating OTP credentials...');
    setTimeout(() => {
      setIsLoading(false);
      const newUser = {
        name: name || 'VALUED INVESTOR',
        email: email || 'investor@Prefin.ai',
        avatarText: (name ? name[0] : 'V').toUpperCase()
      };
      onLoginSuccess(newUser);
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setErrorMsg('');
    setIsLoading(true);
    setLoadingMsg('Connecting to account.google.com...');
    
    setTimeout(() => {
      setLoadingMsg('Authorizing credential tokens with Google OAuth...');
      setTimeout(() => {
        setLoadingMsg('Syncing portfolio records with Prefin Cloud...');
        setTimeout(() => {
          setIsLoading(false);
          const googleUser = {
            name: 'Aniket Talkar',
            email: 'atalkar@gmail.com',
            avatarText: 'G'
          };
          onLoginSuccess(googleUser);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  return (
    <div style={{
      maxWidth: '440px',
      margin: '4rem auto',
      background: 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(25px)',
      borderRadius: '24px',
      border: '1px solid var(--border-glass)',
      padding: '2.5rem',
      boxShadow: 'var(--shadow-lg), 0 10px 40px rgba(0,0,0,0.04)',
      position: 'relative',
      overflow: 'hidden'
    }} className="animate-fade-in">
      
      {/* Loading Overlay */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          zIndex: 100
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(37, 99, 235, 0.1)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', textAlign: 'center', padding: '0 2rem' }}>
            {loadingMsg}
          </span>
        </div>
      )}

      {/* Title block */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(37,99,235,0.06)',
          padding: '0.35rem 0.85rem',
          borderRadius: '100px',
          color: 'var(--primary)',
          fontSize: '0.78rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          marginBottom: '1rem'
        }}>
          <Sparkles size={12} />
          <span>AI Portfolio Doctor & Wealth Intelligence</span>
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
          {activeView === 'login' && 'Unlock AI Portfolio Insights'}
          {activeView === 'signup' && 'Create Account'}
          {activeView === 'forgot' && 'Reset Secure Password'}
          {activeView === 'verify' && 'Verify Account Credentials'}
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', margin: 0, fontWeight: 500 }}>
          {activeView === 'login' && 'Access health scores, live metrics, and rebalancing recommendations.'}
          {activeView === 'signup' && 'Sign up to configure financial goals, track assets, and get daily coach briefs.'}
          {activeView === 'forgot' && 'Enter your verified email to receive a recovery token.'}
          {activeView === 'verify' && 'Confirm the OTP dispatched to your inbox.'}
        </p>
      </div>

      {/* Success / Error Messages */}
      {successMsg && (
        <div style={{
          background: 'var(--success-glow)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          color: 'var(--success)',
          padding: '0.85rem 1rem',
          borderRadius: '12px',
          fontSize: '0.82rem',
          fontWeight: 600,
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          background: 'var(--danger-glow)',
          border: '1px solid rgba(225, 29, 72, 0.2)',
          color: 'var(--danger)',
          padding: '0.85rem 1rem',
          borderRadius: '12px',
          fontSize: '0.82rem',
          fontWeight: 600,
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <ShieldAlert size={16} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Forms */}
      {activeView !== 'verify' && activeView !== 'forgot' && (
        <form onSubmit={handleSimulatedSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {activeView === 'signup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)' }}>Full Name</label>
              <div className="input-field-wrapper" style={{ padding: '0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={15} color="var(--text-light)" />
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Aniket Talkar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)' }}>Email Address</label>
            <div className="input-field-wrapper" style={{ padding: '0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={15} color="var(--text-light)" />
              <input
                type="email"
                className="input-field"
                placeholder="atalkar@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)' }}>Password</label>
              {activeView === 'login' && (
                <button
                  type="button"
                  onClick={() => { setActiveView('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="input-field-wrapper" style={{ padding: '0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={15} color="var(--text-light)" />
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              background: 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.85rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37,99,235,0.15)',
              marginTop: '0.5rem',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
          >
            {activeView === 'login' ? 'Sign In Securely' : 'Register Profile'}
          </button>

          {/* Social login divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', gap: '0.75rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.06)' }} />
            <span style={{ fontSize: '0.68rem', color: 'var(--text-light)', fontWeight: 800 }}>OR PARTNER CHANNELS</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.06)' }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '0.8rem',
              fontWeight: 700,
              fontSize: '0.88rem',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: 'var(--shadow-sm)',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" style={{ marginRight: '0.25rem', flexShrink: 0 }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-3.3-4.53-6.16-4.53z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Toggle view */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--text-light)', fontWeight: 600 }}>
            {activeView === 'login' ? (
              <>
                New to Prefin?{' '}
                <button
                  type="button"
                  onClick={() => { setActiveView('signup'); setErrorMsg(''); setSuccessMsg(''); }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 800, cursor: 'pointer' }}
                >
                  Create account
                </button>
              </>
            ) : (
              <>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setActiveView('login'); setErrorMsg(''); setSuccessMsg(''); }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 800, cursor: 'pointer' }}
                >
                  Login here
                </button>
              </>
            )}
          </div>
        </form>
      )}

      {/* Forgot Password View */}
      {activeView === 'forgot' && (
        <form onSubmit={handleSimulatedSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)' }}>Account Email Address</label>
            <div className="input-field-wrapper" style={{ padding: '0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={15} color="var(--text-light)" />
              <input
                type="email"
                className="input-field"
                placeholder="atalkar@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              background: 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.85rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37,99,235,0.15)',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
          >
            Send Recovery Link
          </button>

          <button
            type="button"
            onClick={() => { setActiveView('login'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              marginTop: '0.5rem'
            }}
          >
            <ArrowLeft size={14} />
            Back to Sign In
          </button>
        </form>
      )}

      {/* OTP Verification View */}
      {activeView === 'verify' && (
        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textAlign: 'center' }}>6-Digit OTP Code</label>
            <div className="input-field-wrapper" style={{ padding: '0 1rem', display: 'flex', justifyContent: 'center' }}>
              <input
                type="text"
                className="input-field"
                placeholder="1 2 3 4 5 6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                style={{
                  textAlign: 'center',
                  letterSpacing: '0.75em',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  width: '100%',
                  maxWidth: '180px'
                }}
              />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', textAlign: 'center', marginTop: '0.25rem', display: 'block', fontWeight: 600 }}>
              Demo Hint: Enter any 6 digits (e.g. 123456)
            </span>
          </div>

          <button
            type="submit"
            style={{
              background: 'var(--success)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.85rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--success)'}
          >
            Verify and Complete Sign Up
          </button>

          <button
            type="button"
            onClick={() => { setActiveView('signup'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              marginTop: '0.5rem'
            }}
          >
            <ArrowLeft size={14} />
            Back to Sign Up
          </button>
        </form>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthGate;
