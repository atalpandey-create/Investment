import React from 'react';
import { IndianRupee, Percent, Calendar, TrendingUp } from 'lucide-react';

const CalculatorInputs = ({ inputs, onInputChange }) => {
  return (
    <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <h2 className="title-gradient" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        Investment Details
      </h2>

      {/* Lumpsum Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--accent)', fontSize: '1.1rem' }}>Initial Investment (Lumpsum)</h3>
        
        <div className="input-group">
          <label style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>One-time Investment</span>
            <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>₹{(inputs.lumpsumAmount || 0).toLocaleString()}</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IndianRupee size={18} color="var(--text-muted)" />
            <input 
              type="number" 
              className="input-field" 
              style={{ flex: 1 }}
              value={inputs.lumpsumAmount || 0}
              onChange={(e) => onInputChange('lumpsumAmount', Number(e.target.value))}
              min="0"
            />
          </div>
          <input 
            type="range" 
            className="slider" 
            min="0" 
            max="1000000" 
            step="5000"
            value={inputs.lumpsumAmount || 0} 
            onChange={(e) => onInputChange('lumpsumAmount', Number(e.target.value))}
          />
        </div>
      </div>

      {/* SIP Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '1.1rem' }}>SIP Investment</h3>
        
        <div className="input-group">
          <label style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Monthly Investment</span>
            <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>₹{inputs.sipAmount.toLocaleString()}</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IndianRupee size={18} color="var(--text-muted)" />
            <input 
              type="number" 
              className="input-field" 
              style={{ flex: 1 }}
              value={inputs.sipAmount}
              onChange={(e) => onInputChange('sipAmount', Number(e.target.value))}
              min="0"
            />
          </div>
          <input 
            type="range" 
            className="slider" 
            min="500" 
            max="100000" 
            step="500"
            value={inputs.sipAmount} 
            onChange={(e) => onInputChange('sipAmount', Number(e.target.value))}
          />
        </div>

        <div className="input-group">
          <label style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>
              Expected Return Rate (p.a)
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '2px' }}>Market profit on investment</span>
            </span>
            <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{inputs.sipRate}%</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Percent size={18} color="var(--text-muted)" />
            <input 
              type="number" 
              className="input-field" 
              style={{ flex: 1 }}
              value={inputs.sipRate}
              onChange={(e) => onInputChange('sipRate', Number(e.target.value))}
              min="1"
              max="30"
              step="0.1"
            />
          </div>
          <input 
            type="range" 
            className="slider" 
            min="1" 
            max="30" 
            step="0.1"
            value={inputs.sipRate} 
            onChange={(e) => onInputChange('sipRate', Number(e.target.value))}
          />
        </div>
        <div className="input-group">
          <label style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>
              Annual Step-up (%)
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '2px' }}>Yearly increase in your SIP deposit</span>
            </span>
            <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{inputs.stepUpRate || 0}%</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="var(--text-muted)" />
            <input 
              type="number" 
              className="input-field" 
              style={{ flex: 1 }}
              value={inputs.stepUpRate || 0}
              onChange={(e) => onInputChange('stepUpRate', Number(e.target.value))}
              min="0"
              max="20"
              step="1"
            />
          </div>
          <input 
            type="range" 
            className="slider" 
            min="0" 
            max="20" 
            step="1"
            value={inputs.stepUpRate || 0} 
            onChange={(e) => onInputChange('stepUpRate', Number(e.target.value))}
          />
        </div>
      </div>

      {/* FD Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--secondary)', fontSize: '1.1rem' }}>Fixed Deposit (Monthly)</h3>
        
        <div className="input-group">
          <label style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Monthly Investment</span>
            <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>₹{inputs.fdAmount.toLocaleString()}</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IndianRupee size={18} color="var(--text-muted)" />
            <input 
              type="number" 
              className="input-field" 
              style={{ flex: 1 }}
              value={inputs.fdAmount}
              onChange={(e) => onInputChange('fdAmount', Number(e.target.value))}
              min="0"
            />
          </div>
          <input 
            type="range" 
            className="slider" 
            min="500" 
            max="100000" 
            step="500"
            value={inputs.fdAmount} 
            onChange={(e) => onInputChange('fdAmount', Number(e.target.value))}
          />
        </div>

        <div className="input-group">
          <label style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Interest Rate (p.a)</span>
            <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{inputs.fdRate}%</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Percent size={18} color="var(--text-muted)" />
            <input 
              type="number" 
              className="input-field" 
              style={{ flex: 1 }}
              value={inputs.fdRate}
              onChange={(e) => onInputChange('fdRate', Number(e.target.value))}
              min="1"
              max="15"
              step="0.1"
            />
          </div>
          <input 
            type="range" 
            className="slider" 
            min="1" 
            max="15" 
            step="0.1"
            value={inputs.fdRate} 
            onChange={(e) => onInputChange('fdRate', Number(e.target.value))}
          />
        </div>
      </div>

      {/* Common Section */}
      <div>
        <h3 style={{ marginBottom: '1rem', color: 'var(--accent)', fontSize: '1.1rem' }}>Duration</h3>
        
        <div className="input-group">
          <label style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Time Period (Years)</span>
            <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{inputs.years} Yr</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="var(--text-muted)" />
            <input 
              type="number" 
              className="input-field" 
              style={{ flex: 1 }}
              value={inputs.years}
              onChange={(e) => onInputChange('years', Number(e.target.value))}
              min="1"
              max="40"
            />
          </div>
          <input 
            type="range" 
            className="slider" 
            min="1" 
            max="40" 
            step="1"
            value={inputs.years} 
            onChange={(e) => onInputChange('years', Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};

export default CalculatorInputs;
