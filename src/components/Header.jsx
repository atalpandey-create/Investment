import React from 'react';
import { Activity, Sparkles, PieChart, Calculator, Bell, ShieldAlert } from 'lucide-react';

const Header = ({ activeTab, setActiveTab, topGainers, marketError, marketLoading, user, onLogout }) => {
  const renderMarqueeList = (isDup = false) => {
    // If we have top gainers data (either live or cached), display them!
    if (topGainers && topGainers.length > 0) {
      return topGainers.map((stock, idx) => {
        const changeVal = stock.change != null ? Number(stock.change) : 0;
        const isPositive = changeVal >= 0;
        return (
          <div 
            key={`${stock.symbol}-${isDup ? 'dup-' : ''}${idx}`} 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.35rem',
              fontSize: '0.82rem',
              fontWeight: 700,
            }}
          >
            <span style={{ color: 'var(--text-main)' }}>{stock.symbol}</span>
            <span style={{ 
              color: isPositive ? 'var(--success)' : 'var(--danger)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.1rem',
              fontWeight: 800
            }}>
              {isPositive ? '▲' : '▼'} {isPositive ? '+' : ''}{changeVal.toFixed(2)}%
            </span>
          </div>
        );
      });
    }
    
    // If we are loading and have no data (neither live nor cache), show connecting state
    if (marketLoading) {
      return Array(5).fill(0).map((_, idx) => (
        <span key={idx} style={{ color: 'var(--text-light)', fontWeight: 700, fontSize: '0.82rem' }}>
          🔄 Connecting to market feed...
        </span>
      ));
    }

    // If live data fails and cache is empty, loop a friendly error warning to prevent empty space
    return Array(5).fill(0).map((_, idx) => (
      <span key={idx} style={{ color: 'var(--danger)', fontWeight: 800, fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        ⚠️ Market Feed Unavailable
      </span>
    ));
  };

  return (
    <header style={{ marginBottom: '2.5rem', zIndex: 1000, position: 'relative' }}>
      {/* Light Glassmorphic Live Marquee Ticker */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        margin: '-1.5rem -1.5rem 1.5rem -1.5rem',
        padding: '0.65rem 1.5rem',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        boxShadow: '0 2px 15px rgba(0,0,0,0.01)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          fontSize: '0.78rem', 
          fontWeight: 800, 
          color: 'var(--primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          borderRight: '1px solid rgba(0,0,0,0.08)',
          paddingRight: '1rem',
          flexShrink: 0,
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.01)'
        }}>
          <Activity size={13} className="float-3d" />
          <span>Top Gainers</span>
        </div>

        {/* Marquee Animation loops */}
        <div style={{
          display: 'flex',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          width: '100%',
          position: 'relative'
        }}>
          <div style={{
            display: 'inline-flex',
            gap: '3rem',
            animation: 'tickerScroll 25s linear infinite',
            paddingRight: '3rem'
          }}>
            {renderMarqueeList(false)}
          </div>
          
          {/* Duplicated list to allow seamless loop */}
          <div style={{
            display: 'inline-flex',
            gap: '3rem',
            animation: 'tickerScroll 25s linear infinite',
            pointerEvents: 'none'
          }}>
            {renderMarqueeList(true)}
          </div>
        </div>
      </div>

      {/* Navigation and Brand Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        padding: '0.5rem 0'
      }}>
        {/* Brand identity logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
          <div style={{ display: 'flex', alignItems: 'center' }} className="float-3d">
            <svg width="48" height="40" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '-5px' }}>
              {/* Green Hollow Diamond */}
              <path d="M 40 10 L 10 40 L 40 70 L 60 50" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              {/* Green Bar Chart */}
              <rect x="55" y="30" width="6" height="10" rx="2" fill="#10b981" />
              <rect x="65" y="22" width="6" height="18" rx="2" fill="#10b981" />
              <rect x="75" y="14" width="6" height="26" rx="2" fill="#10b981" />
              
              {/* Dark Blue Filled Diamond */}
              <path d="M 60 30 L 35 55 L 60 80 L 95 45 L 75 25 Z" fill="#0f172a" stroke="#ffffff" strokeWidth="4" strokeLinejoin="round" />
              
              {/* White 'F' Cutout */}
              <path d="M 50 65 L 50 45 L 70 45" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 50 55 L 65 55" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1 style={{ 
              fontSize: '1.65rem', 
              color: 'var(--text-main)',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: 0
            }}>
              Prefin
            </h1>
            <p style={{ color: 'var(--text-light)', fontSize: '0.7rem', fontWeight: 700, margin: 0, letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span>&mdash;</span> SMART WEALTH PARTNER <span>&mdash;</span>
            </p>
          </div>
        </div>

        {/* Navigation and User Profile Wrapper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Tab Buttons bar */}
          <nav style={{
            display: 'flex',
            gap: '0.2rem',
            background: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(20px)',
            padding: '0.35rem',
            borderRadius: '100px',
            border: '1px solid var(--border-glass)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <button 
              className={`nav-tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <Activity size={14} />
              Dashboard
            </button>
            <button 
              className={`nav-tab-button ${activeTab === 'recommendations' ? 'active' : ''}`}
              onClick={() => setActiveTab('recommendations')}
            >
              <Sparkles size={14} />
              AI Advice
            </button>

            <button 
              className={`nav-tab-button ${activeTab === 'portfolio' ? 'active' : ''}`}
              onClick={() => setActiveTab('portfolio')}
            >
              <PieChart size={14} />
              Portfolio
            </button>
            <button 
              className={`nav-tab-button ${activeTab === 'alerts' ? 'active' : ''}`}
              onClick={() => setActiveTab('alerts')}
            >
              <Bell size={14} />
              Alerts
            </button>
            <button 
              className={`nav-tab-button ${activeTab === 'doctor' ? 'active' : ''}`}
              onClick={() => setActiveTab('doctor')}
              style={{ 
                border: activeTab === 'doctor' ? 'none' : '1px solid rgba(16, 185, 129, 0.15)', 
                color: activeTab === 'doctor' ? '#ffffff' : 'var(--success)',
                background: activeTab === 'doctor' ? 'var(--success)' : 'transparent',
                boxShadow: activeTab === 'doctor' ? '0 4px 12px rgba(16, 185, 129, 0.2)' : 'none',
                fontWeight: 700
              }}
            >
              <ShieldAlert size={14} />
              Portfolio Doctor
            </button>
          </nav>

          {/* User profile block */}
          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(20px)',
              padding: '0.25rem 0.75rem 0.25rem 0.25rem',
              borderRadius: '100px',
              border: '1px solid var(--border-glass)',
              fontSize: '0.82rem',
              fontWeight: 700,
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary) 0%, #10b981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.82rem',
                fontWeight: 800
              }}>
                {user.avatarText || user.name[0].toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '100px' }}>
                <span style={{ color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>{user.name}</span>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', lineHeight: 1 }}>Pro Member</span>
              </div>
              <button 
                onClick={onLogout}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--danger)',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  marginLeft: '0.25rem',
                  padding: '0.2rem 0.4rem',
                  borderRadius: '6px',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </header>
  );
};

export default Header;
