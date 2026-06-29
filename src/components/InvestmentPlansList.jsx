import React, { useState, useEffect } from 'react';
import { ShieldCheck, Flame, Scale, Landmark, PieChart, TrendingUp, RefreshCw, CheckCircle2 } from 'lucide-react';

const PlanCard = ({ title, category, risk, returnEstimate, description, icon }) => {
  const getRiskColor = (r) => {
    switch(r.toLowerCase()) {
      case 'low risk': return '#10b981'; // Green
      case 'moderate risk': return '#f59e0b'; // Yellow/Orange
      case 'high risk': return '#ef4444'; // Red
      default: return 'var(--primary)';
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.6)',
      border: '1px solid var(--glass-border)',
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '1rem',
      display: 'flex',
      gap: '1rem',
      alignItems: 'flex-start',
      boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
    }}>
      <div style={{
        background: `rgba(99, 102, 241, 0.1)`,
        padding: '0.75rem',
        borderRadius: '12px',
        color: 'var(--primary)'
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>{title}</h4>
          <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: 'bold', 
            padding: '0.25rem 0.5rem', 
            borderRadius: '20px', 
            background: `${getRiskColor(risk)}20`,
            color: getRiskColor(risk)
          }}>
            {risk}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span><strong>Category:</strong> {category}</span>
          <span><strong>Est. Yield:</strong> {returnEstimate}</span>
        </div>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {description}
        </p>
      </div>
    </div>
  );
};

const InvestmentPlansList = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(new Date());

  const handleSync = () => {
    setIsSyncing(true);
    // Simulate network delay for fetching latest plans
    setTimeout(() => {
      setIsSyncing(false);
      setLastSynced(new Date());
    }, 1500);
  };

  useEffect(() => {
    // Auto-update every 24 hours
    const interval = setInterval(handleSync, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.7s', padding: '2rem', marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)', fontSize: '1.4rem', margin: 0 }}>
          <PieChart color="var(--primary)" size={28} />
          Top Investment Plans & Risk Analysis (2026)
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <CheckCircle2 size={14} color="#10b981" />
            Last Synced: {lastSynced.toLocaleDateString()} {lastSynced.toLocaleTimeString()}
          </span>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: isSyncing ? 'wait' : 'pointer',
              fontWeight: 500,
              fontSize: '0.9rem',
              opacity: isSyncing ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
          >
            <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />
            {isSyncing ? 'Syncing...' : 'Sync Market Data'}
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* SIP Section */}
        <div>
          <h4 style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Flame size={20} /> Recommended SIP Mutual Funds
          </h4>
          
          <PlanCard 
            title="Quant Small Cap Fund"
            category="Equity - Small Cap"
            risk="High Risk"
            returnEstimate="20% - 25% p.a."
            description="Aggressively managed small-cap fund with high growth potential. Ideal for long-term investors (7+ years) willing to tolerate significant market volatility."
            icon={<TrendingUp size={24} />}
          />
          
          <PlanCard 
            title="Motilal Oswal Midcap Fund"
            category="Equity - Mid Cap"
            risk="High Risk"
            returnEstimate="18% - 22% p.a."
            description="Focuses on high-quality mid-sized companies with strong competitive advantages. Offers excellent balance of growth and relative stability."
            icon={<Landmark size={24} />}
          />

          <PlanCard 
            title="Parag Parikh Flexi Cap Fund"
            category="Equity - Flexi Cap"
            risk="High Risk"
            returnEstimate="14% - 16% p.a."
            description="Invests across large, mid, and small-cap stocks, plus international equities. Excellent for long-term wealth creation (5+ years) with strong downside protection."
            icon={<Scale size={24} />}
          />
        </div>

        {/* FD Section */}
        <div>
          <h4 style={{ color: 'var(--secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={20} /> Top Fixed Deposit Rates
          </h4>

          <PlanCard 
            title="Small Finance Banks (e.g., Unity, Utkarsh)"
            category="Bank Fixed Deposit"
            risk="Low Risk"
            returnEstimate="8.5% - 9.0% p.a."
            description="Offers the highest interest rates in the market. Highly safe for deposits up to ₹5 Lakhs due to DICGC (RBI) insurance coverage."
            icon={<Landmark size={24} />}
          />

          <PlanCard 
            title="Major Public/Private Banks (SBI, HDFC, ICICI)"
            category="Bank Fixed Deposit"
            risk="Low Risk"
            returnEstimate="7.2% - 7.5% p.a."
            description="The safest possible investment avenues with massive institutional backing. Ideal for preserving capital and emergency funds."
            icon={<ShieldCheck size={24} />}
          />
          
          <PlanCard 
            title="Senior Citizen FDs"
            category="Special FD Scheme"
            risk="Low Risk"
            returnEstimate="Up to 9.5% p.a."
            description="Banks offer an additional 0.50% to 0.75% premium for senior citizens. Super seniors (80+) get even higher rates. Great for retirement income."
            icon={<ShieldCheck size={24} />}
          />
        </div>

      </div>
    </div>
  );
};

export default InvestmentPlansList;
