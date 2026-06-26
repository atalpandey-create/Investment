import React, { useState } from 'react';
import { Bell, Plus, Trash2, ShieldAlert, Sparkles, CheckCircle2, DollarSign } from 'lucide-react';

const defaultAlerts = [
  { id: 1, type: 'Price Alert', asset: 'NIFTY 50', condition: 'Above', threshold: 24000, active: true },
  { id: 2, type: 'Dividend Alert', asset: 'TCS', condition: 'Dividend Declared', threshold: 28, active: true },
  { id: 3, type: 'IPO Alert', asset: 'Hyundai India', condition: 'Allotment Date', threshold: 0, active: true },
  { id: 4, type: 'Market Crash', asset: 'Global Core Index', condition: 'Drawdown > 3%', threshold: 3, active: false }
];

const Alerts = ({ marketData, alerts, setAlerts }) => {
  const [newType, setNewType] = useState('Price Alert');
  const [newAsset, setNewAsset] = useState('NIFTY 50');
  const [newCondition, setNewCondition] = useState('Above');
  const [newThreshold, setNewThreshold] = useState('');

  const handleAddAlert = (e) => {
    e.preventDefault();
    if (newType === 'Price Alert' && !newThreshold) return;

    const newA = {
      id: Date.now(),
      type: newType,
      asset: newAsset,
      condition: newCondition,
      threshold: Number(newThreshold) || 0,
      active: true
    };

    setAlerts(prev => [...prev, newA]);
    setNewThreshold('');
  };

  const handleDeleteAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleToggleActive = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div>
        <h2 style={{ color: '#ffffff', fontSize: '1.6rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Bell size={24} color="var(--primary)" />
          Smart Alert Control Center
        </h2>
        <p style={{ color: 'var(--dark-text-muted)', fontSize: '0.85rem', marginTop: '-0.75rem', fontWeight: 500 }}>
          Set real-time triggers for price movements, corporate dividends, listing dates, and global indices.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }} className="dashboard-grid">
        
        {/* Left Column: Create Alert Form */}
        <div className="wealth-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Plus size={18} color="var(--primary)" />
            Schedule New Pulse Alert
          </h3>
          <form onSubmit={handleAddAlert} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Alert Category</label>
              <select
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '0.75rem 1rem',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  outline: 'none'
                }}
                value={newType}
                onChange={(e) => {
                  setNewType(e.target.value);
                  if (e.target.value === 'Dividend Alert') {
                    setNewAsset('TCS');
                    setNewCondition('Dividend Declared');
                  } else if (e.target.value === 'IPO Alert') {
                    setNewAsset('Hyundai India');
                    setNewCondition('Allotment Date');
                  } else {
                    setNewAsset('NIFTY 50');
                    setNewCondition('Above');
                  }
                }}
              >
                <option value="Price Alert">Price Alert</option>
                <option value="Dividend Alert">Dividend Alert</option>
                <option value="IPO Alert">IPO Alert</option>
                <option value="Market Crash">Market Crash Protection</option>
              </select>
            </div>

            {newType === 'Price Alert' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Select Target Asset</label>
                    <select
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '0.75rem 1rem',
                        color: 'var(--text-main)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        outline: 'none'
                      }}
                      value={newAsset}
                      onChange={(e) => setNewAsset(e.target.value)}
                    >
                      {Object.keys(marketData).map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Condition</label>
                    <select
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '0.75rem 1rem',
                        color: 'var(--text-main)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        outline: 'none'
                      }}
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                    >
                      <option value="Above">Goes Above (≥)</option>
                      <option value="Below">Drops Below (≤)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Target Price Threshold</label>
                  <div className="input-field-wrapper" style={{ padding: '0 0.5rem' }}>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="Enter target amount"
                      value={newThreshold}
                      onChange={(e) => setNewThreshold(e.target.value)}
                      required
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '4px' }}>
                    Current price: {marketData[newAsset] && marketData[newAsset].price != null ? marketData[newAsset].price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : 'Unavailable'}
                  </span>
                </div>
              </>
            )}

            {newType === 'Dividend Alert' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Asset Name</label>
                <div className="input-field-wrapper" style={{ padding: '0 0.5rem' }}>
                  <input
                    type="text"
                    className="input-field"
                    value={newAsset}
                    onChange={(e) => setNewAsset(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {newType === 'IPO Alert' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>IPO Prospect Name</label>
                <div className="input-field-wrapper" style={{ padding: '0 0.5rem' }}>
                  <input
                    type="text"
                    className="input-field"
                    value={newAsset}
                    onChange={(e) => setNewAsset(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {newType === 'Market Crash' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Daily Drop Tolerance (%)</label>
                <div className="input-field-wrapper" style={{ padding: '0 0.5rem' }}>
                  <input
                    type="number"
                    className="input-field"
                    value={newThreshold}
                    onChange={(e) => setNewThreshold(e.target.value)}
                    placeholder="e.g. 3, 5"
                    required
                    min="1"
                    max="10"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              style={{
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
                boxShadow: '0 4px 12px rgba(37,99,235,0.12)',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
            >
              <Bell size={18} />
              Set Pulse Alert
            </button>
          </form>
        </div>

        {/* Right Column: Active Alerts Feed */}
        <div className="wealth-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Active Scheduled Alerts ({alerts.filter(a => a.active).length})
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {alerts.map(alert => (
              <div
                key={alert.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f8fafc',
                  border: '1px solid var(--border-light)',
                  padding: '1rem',
                  borderRadius: '14px',
                  opacity: alert.active ? 1 : 0.65,
                  transition: 'opacity 0.2s'
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ 
                      fontSize: '0.68rem', 
                      fontWeight: 700, 
                      textTransform: 'uppercase',
                      color: alert.type === 'Market Crash' ? 'var(--danger)' : 'var(--primary)',
                      background: alert.type === 'Market Crash' ? 'var(--danger-glow)' : 'rgba(37,99,235,0.06)',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px'
                    }}>
                      {alert.type}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{alert.asset}</span>
                  </div>
                  <h4 style={{ color: 'var(--text-main)', fontSize: '0.92rem', margin: 0, fontWeight: 700 }}>
                    {alert.type === 'Price Alert' && `Notify if price goes ${alert.condition.toLowerCase()} ${alert.threshold.toLocaleString()}`}
                    {alert.type === 'Dividend Alert' && `Dividend declarations exceeding ₹${alert.threshold}`}
                    {alert.type === 'IPO Alert' && `Listing & allotment deadline reminders`}
                    {alert.type === 'Market Crash' && `Alert on single-day indices drop > ${alert.threshold}%`}
                  </h4>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {/* Toggle Button switch */}
                  <button
                    onClick={() => handleToggleActive(alert.id)}
                    style={{
                      background: alert.active ? 'var(--success)' : '#e2e8f0',
                      border: 'none',
                      borderRadius: '100px',
                      width: '36px',
                      height: '20px',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      left: alert.active ? '18px' : '2px',
                      top: '2px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      transition: 'left 0.2s'
                    }} />
                  </button>

                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-light)',
                      cursor: 'pointer',
                      padding: '0.2rem',
                      borderRadius: '4px'
                    }}
                    className="hover-danger"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {alerts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No active notifications set.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Alerts;
