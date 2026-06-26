import React from 'react';
import { ShieldCheck, Info, Database } from 'lucide-react';

const Footer = ({ setActiveTab }) => {
  return (
    <footer style={{ marginTop: '5rem', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '3rem', paddingBottom: '3rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        
        {/* About Section */}
        <div>
          <h4 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1.05rem', fontWeight: 800 }}>Prefin</h4>
          <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', lineHeight: 1.6, fontWeight: 500 }}>
            Prefin is a next-generation algorithmic wealth platform delivering live market insights, projections, and customized allocation guidance. Built for modern builders.
          </p>
        </div>

        {/* Resources */}
        <div>
          <h4 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1.05rem', fontWeight: 800 }}>Navigation</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <span style={{ color: 'var(--text-light)', fontSize: '0.85rem', cursor: 'pointer', transition: 'color 0.2s', fontWeight: 600 }} onClick={() => setActiveTab('dashboard')} className="hover-dark">Dashboard</span>
            <span style={{ color: 'var(--text-light)', fontSize: '0.85rem', cursor: 'pointer', transition: 'color 0.2s', fontWeight: 600 }} onClick={() => setActiveTab('recommendations')} className="hover-dark">AI Advisor Advice</span>
            <span style={{ color: 'var(--text-light)', fontSize: '0.85rem', cursor: 'pointer', transition: 'color 0.2s', fontWeight: 600 }} onClick={() => setActiveTab('calculator')} className="hover-dark">Projections Calculator</span>
            <span style={{ color: 'var(--text-light)', fontSize: '0.85rem', cursor: 'pointer', transition: 'color 0.2s', fontWeight: 600 }} onClick={() => setActiveTab('portfolio')} className="hover-dark">Portfolio Tracker</span>
          </div>
        </div>

        {/* Data Sources */}
        <div>
          <h4 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={15} color="var(--primary)" /> Data Sources
          </h4>
          <p style={{ color: 'var(--text-light)', fontSize: '0.82rem', lineHeight: 1.5, fontWeight: 500 }}>
            Our algorithmic models feed from transparent public datasets:
          </p>
          <ul style={{ color: 'var(--text-light)', fontSize: '0.82rem', paddingLeft: '1.1rem', marginTop: '0.5rem', lineHeight: 1.6, fontWeight: 500 }}>
            <li>NSE & BSE Equities (Delayed 15m)</li>
            <li>Reserve Bank of India Bulletins</li>
            <li>CoinDesk Cryptocurrencies indexes</li>
            <li>Yahoo Finance Historical feeds</li>
          </ul>
        </div>
      </div>

      {/* Compliance / Risk Warning Card */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--border-glass)',
        borderRadius: '20px',
        padding: '1.5rem',
        marginBottom: '2.5rem',
        display: 'flex',
        gap: '1.25rem',
        alignItems: 'flex-start',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <ShieldCheck size={26} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '0.1rem' }} />
        <div>
          <h5 style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: 700 }}>
            SEBI Regulatory Information & Investment Risk
          </h5>
          <p style={{ color: 'var(--text-light)', fontSize: '0.8rem', lineHeight: 1.6, fontWeight: 500 }}>
            <strong>Risk Warning:</strong> Wealth building tools are subject to standard market fluctuations. Projections, forecasting algorithms, and advisory chat statements compiled by Prefin are for educational purposes only. Past trends do not indicate future returns. Under SEBI laws, please verify and audits with registered investment professionals before deploying significant capitals.
          </p>
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: '0.78rem',
        color: 'var(--text-light)',
        fontWeight: 500
      }}>
        <span>© 2026 Prefin Technologies. Apple & Stripe Design inspired layout.</span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Security & Audits</span>
        </div>
      </div>

      <style>{`
        .hover-dark:hover {
          color: var(--text-main) !important;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
