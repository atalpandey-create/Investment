import React from 'react';
import { Wallet, TrendingUp, IndianRupee } from 'lucide-react';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

const ResultCard = ({ title, value, icon, color, delay }) => (
  <div 
    className="glass-panel animate-fade-in" 
    style={{ 
      animationDelay: delay,
      padding: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      borderLeft: `4px solid ${color}`
    }}
  >
    <div style={{
      background: `rgba(${color === 'var(--primary)' ? '139, 92, 246' : color === 'var(--secondary)' ? '236, 72, 153' : '6, 182, 212'}, 0.2)`,
      padding: '1rem',
      borderRadius: '16px',
      color: color
    }}>
      {icon}
    </div>
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem', fontWeight: 500 }}>{title}</p>
      <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>{formatCurrency(value)}</h3>
    </div>
  </div>
);

const ResultsDashboard = ({ results }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
      <ResultCard 
        title="Total Invested Amount" 
        value={results.totalInvested} 
        icon={<Wallet size={24} />} 
        color="var(--accent)" 
        delay="0.2s" 
      />
      <ResultCard 
        title="Est. Returns (Wealth Gained)" 
        value={results.totalReturns} 
        icon={<TrendingUp size={24} />} 
        color="var(--secondary)" 
        delay="0.3s" 
      />
      <ResultCard 
        title="Total Maturity Value" 
        value={results.totalValue} 
        icon={<IndianRupee size={24} />} 
        color="var(--primary)" 
        delay="0.4s" 
      />
    </div>
  );
};

export default ResultsDashboard;
