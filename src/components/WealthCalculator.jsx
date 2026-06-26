import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from 'recharts';
import { IndianRupee, Percent, Calendar, TrendingUp, Lightbulb, Wallet, Calculator, Info, AlertCircle, Plus, CheckCircle2 } from 'lucide-react';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const total = payload[0].value + payload[1].value;
    
    return (
      <div style={{ 
        background: '#ffffff', 
        border: '1px solid var(--border-light)',
        borderRadius: '12px',
        padding: '1rem',
        boxShadow: 'var(--shadow-md)',
      }}>
        <p style={{ color: 'var(--text-main)', fontWeight: 'bold', marginBottom: '0.5rem' }}>Year {label}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <p style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>
            Invested: ₹{payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600 }}>
            Est. Returns: ₹{payload[1].value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <div style={{ height: '1px', background: 'var(--border-light)', margin: '0.25rem 0' }} />
          <p style={{ color: 'var(--text-main)', fontWeight: 'bold', fontSize: '0.95rem' }}>
            Total Value: ₹{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const calculateYearByYear = (inputs) => {
  const chartData = [];
  let totalInvested = inputs.lumpsumAmount || 0;
  let totalMaturity = inputs.lumpsumAmount || 0;
  
  const sipMonthlyRate = (inputs.sipRate || 0) / 12 / 100;
  const fdMonthlyRate = (inputs.fdRate || 0) / 12 / 100;
  const lumpsumAnnualRate = (inputs.sipRate || 0) / 100; 
  
  let currentSipAmount = inputs.sipAmount || 0;
  let currentFdAmount = inputs.fdAmount || 0;

  let currentSipMaturity = 0;
  let currentFdMaturity = 0;
  let currentLumpsumMaturity = inputs.lumpsumAmount || 0;

  for (let year = 1; year <= inputs.years; year++) {
    currentLumpsumMaturity = currentLumpsumMaturity * (1 + lumpsumAnnualRate);

    for (let m = 1; m <= 12; m++) {
      currentSipMaturity = (currentSipMaturity + currentSipAmount) * (1 + sipMonthlyRate);
      currentFdMaturity = (currentFdMaturity + currentFdAmount) * (1 + fdMonthlyRate);
    }

    totalInvested += (currentSipAmount * 12) + (currentFdAmount * 12);
    totalMaturity = currentLumpsumMaturity + currentSipMaturity + currentFdMaturity;

    chartData.push({
      year,
      invested: Math.round(totalInvested),
      returns: Math.round(totalMaturity - totalInvested),
      total: Math.round(totalMaturity)
    });

    if (inputs.stepUpRate > 0) {
      currentSipAmount += currentSipAmount * (inputs.stepUpRate / 100);
    }
  }

  if (inputs.years === 0) {
    chartData.push({ year: 0, invested: totalInvested, returns: 0, total: totalInvested });
  }

  return {
    results: {
      totalInvested,
      totalReturns: totalMaturity - totalInvested,
      totalValue: totalMaturity
    },
    chartData
  };
};

const WealthCalculator = ({ user, inputs, onInputChange, marketData }) => {
  const { results, chartData } = useMemo(() => calculateYearByYear(inputs), [inputs]);

  const getAssetPrice = (ticker) => {
    if (!ticker) return 0;
    if (marketData && marketData[ticker] && marketData[ticker].price) return marketData[ticker].price;
    const mockPrices = {
      'TATAMOTORS': 980, 'LT': 3450, 'HDFCBANK': 1650, 'RELIANCE': 2950, 'ZOMATO': 195, 'ITC': 430,
      'NHAI-BOND': 1000, 'PFC-NCD': 1000, 'RBI-FRSB': 1000, 'SHRIRAM-NCD': 1000, 'SGB-GOVT': 7200,
      'NIFTY-ETF': 245, 'CPSE-ETF': 85, 'MIDCAP-ETF': 120, 'NASDAQ-ETF': 140, 'GOLD-ETF': 62
    };
    return mockPrices[ticker] || 100;
  };

  const isLotBased = inputs.assetContext && [
    'TATAMOTORS', 'LT', 'HDFCBANK', 'RELIANCE', 'ZOMATO', 'ITC',
    'NHAI-BOND', 'PFC-NCD', 'RBI-FRSB', 'SHRIRAM-NCD', 'SGB-GOVT',
    'NIFTY-ETF', 'CPSE-ETF', 'MIDCAP-ETF', 'NASDAQ-ETF', 'GOLD-ETF'
  ].includes(inputs.assetContext.ticker);

  const assetPrice = isLotBased ? getAssetPrice(inputs.assetContext.ticker) : 0;
  
  const handleLotsChange = (newLots) => {
    const validLots = Math.max(0, Number(newLots));
    onInputChange('lots', validLots);
    onInputChange('lumpsumAmount', validLots * assetPrice);
  };

  const [addedToPortfolio, setAddedToPortfolio] = React.useState(false);

  const handleAddToPortfolio = () => {
    let holdings = JSON.parse(localStorage.getItem(`Prefin_holdings_${user?.id || 'default'}`) || 'null');
    if (!holdings) {
      holdings = [];
    }
    
    let purchaseLots = JSON.parse(localStorage.getItem(`Prefin_purchase_lots_${user?.id || 'default'}`) || '[]');

    const newId = Date.now();
    
    const qty = isLotBased ? (inputs.lots || 0) : 1;
    const price = isLotBased ? assetPrice : (inputs.lumpsumAmount || 0);

    if (qty === 0 && price === 0) return;

    const newHolding = {
      id: newId,
      name: inputs.assetContext.name,
      symbol: inputs.assetContext.ticker,
      category: isLotBased ? "Equity" : "Mutual Funds",
      sector: inputs.assetContext.type,
      quantity: qty,
      buyPrice: price,
      broker: "AI Recommendations",
      buyDate: new Date().toISOString().split('T')[0]
    };
    
    holdings.push(newHolding);
    
    const newLot = {
      id: Date.now() + 1,
      holdingId: newId,
      quantity: qty,
      price: price,
      date: new Date().toISOString().split('T')[0]
    };
    purchaseLots.push(newLot);

    localStorage.setItem(`Prefin_holdings_${user?.id || 'default'}`, JSON.stringify(holdings));
    localStorage.setItem(`Prefin_purchase_lots_${user?.id || 'default'}`, JSON.stringify(purchaseLots));

    setAddedToPortfolio(true);
    setTimeout(() => setAddedToPortfolio(false), 3000);
  };

  const getSuggestions = () => {
    const suggestions = [];

    if (inputs.sipRate < 10) {
      suggestions.push({
        type: 'info',
        icon: <Info size={18} />,
        title: "Conservative Growth Projection",
        text: "Large-cap mutual funds in India average 12-15% CAGR over long horizons. Projections under 10% may undersell your final portfolio maturity size."
      });
    } else if (inputs.sipRate > 16) {
      suggestions.push({
        type: 'warning',
        icon: <AlertCircle size={18} />,
        title: "Aggressive Returns Assumption",
        text: "Expecting >16% compounding over decades is aggressive. Plan on a 12% baseline for safety when funding major goals."
      });
    }

    if (inputs.fdAmount > 0 && inputs.fdRate < 7.0) {
      suggestions.push({
        type: 'info',
        icon: <Lightbulb size={18} />,
        title: "Optimize Fixed Income Yields",
        text: "Major corporate deposits and Small Finance Banks currently offer 7.8% - 8.2% annual rates. Look beyond traditional savings accounts."
      });
    }

    const totalMonthly = inputs.sipAmount + inputs.fdAmount;
    if (totalMonthly > 0) {
      const sipPercentage = (inputs.sipAmount / totalMonthly) * 100;
      if (inputs.years >= 10 && sipPercentage < 60) {
        suggestions.push({
          type: 'insight',
          icon: <TrendingUp size={18} />,
          title: "Equity Allocation Review",
          text: "For time horizons above 10 years, conservative allocations limit compounding strength. Consider shifting debt balances to equity SIPs to defeat inflation."
        });
      }
    }

    if (suggestions.length === 0) {
      suggestions.push({
        type: 'success',
        icon: <Info size={18} />,
        title: "Optimal Strategy Set",
        text: "Your allocation inputs and return assumptions represent an balanced, highly realistic portfolio expectation."
      });
    }

    return suggestions;
  };

  const suggestions = getSuggestions();

  const getSuggestionStyle = (type) => {
    switch(type) {
      case 'warning': return { color: 'var(--danger)', borderLeft: '4px solid var(--danger)', bg: 'rgba(239, 68, 68, 0.03)' };
      case 'insight': return { color: 'var(--primary)', borderLeft: '4px solid var(--primary)', bg: 'rgba(37, 99, 235, 0.03)' };
      case 'success': return { color: 'var(--success)', borderLeft: '4px solid var(--success)', bg: 'rgba(16, 185, 129, 0.03)' };
      default: return { color: '#0ea5e9', borderLeft: '4px solid #0ea5e9', bg: 'rgba(14, 165, 233, 0.03)' };
    }
  };

  const formatYAxis = (value) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(0)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
    return `₹${value}`;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h2 style={{ color: 'var(--text-main)', fontSize: '1.6rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <Calculator size={24} color="var(--primary)" />
        AI Projection & Wealth Calculator
      </h2>

      {inputs.assetContext && (
        <div style={{ 
          background: 'rgba(37,99,235,0.05)', 
          border: '1px solid rgba(37,99,235,0.15)', 
          borderRadius: '12px', 
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '0.5rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '8px' }}>
            <TrendingUp size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Simulating: {inputs.assetContext.name}
              <span style={{ fontSize: '0.7rem', background: 'var(--text-light)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '100px', textTransform: 'uppercase' }}>
                {inputs.assetContext.ticker}
              </span>
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 600 }}>
              {inputs.assetContext.type} 
              {inputs.assetContext.lockIn > 0 && ` • ${inputs.assetContext.lockIn} Year Lock-in Period`}
            </p>
          </div>
          <button 
            onClick={handleAddToPortfolio}
            disabled={addedToPortfolio}
            style={{
              background: addedToPortfolio ? 'var(--success)' : 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: addedToPortfolio ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
              boxShadow: addedToPortfolio ? 'none' : '0 4px 12px rgba(37,99,235,0.15)'
            }}
          >
            {addedToPortfolio ? <><CheckCircle2 size={16} /> Added to Portfolio</> : <><Plus size={16} /> Add to Portfolio</>}
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        
        {/* Left Side: Inputs Card */}
        <div className="wealth-card">
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            Investment Parameters
          </h3>

          {/* Lots Input (Conditional) */}
          {isLotBased && (
            <div className="input-group" style={{ background: 'rgba(37,99,235,0.03)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(37,99,235,0.1)' }}>
              <label>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Number of Units/Lots</span>
                <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{inputs.lots || 0} Units</span>
              </label>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Current Price: ₹{assetPrice}</span>
                <span>Value: ₹{((inputs.lots || 0) * assetPrice).toLocaleString()}</span>
              </div>
              <div className="input-field-wrapper" style={{ borderColor: 'var(--primary)' }}>
                <Wallet size={16} color="var(--primary)" />
                <input 
                  type="number" 
                  className="input-field" 
                  value={inputs.lots || 0}
                  onChange={(e) => handleLotsChange(e.target.value)}
                />
              </div>
              <input 
                type="range" 
                className="input-slider" 
                min="0" 
                max="1000" 
                step="1"
                value={inputs.lots || 0}
                onChange={(e) => handleLotsChange(e.target.value)}
              />
            </div>
          )}

          {/* Lumpsum */}
          {!isLotBased && (
            <div className="input-group">
              <label>
                <span>One-Time Investment (Lumpsum)</span>
                <span style={{ color: 'var(--text-main)' }}>₹{(inputs.lumpsumAmount || 0).toLocaleString()}</span>
              </label>
              <div className="input-field-wrapper">
                <IndianRupee size={16} color="var(--text-muted)" />
                <input 
                  type="number" 
                  className="input-field" 
                  value={inputs.lumpsumAmount}
                  onChange={(e) => onInputChange('lumpsumAmount', Math.max(0, Number(e.target.value)))}
                />
              </div>
              <input 
                type="range" 
                className="input-slider" 
                min="0" 
                max="500000" 
                step="5000"
                value={inputs.lumpsumAmount}
                onChange={(e) => onInputChange('lumpsumAmount', Number(e.target.value))}
              />
            </div>
          )}

          {/* SIP */}
          {!isLotBased && (
            <div className="input-group">
              <label>
                <span>Monthly Equity SIP</span>
                <span style={{ color: 'var(--text-main)' }}>₹{(inputs.sipAmount || 0).toLocaleString()}</span>
              </label>
              <div className="input-field-wrapper">
                <IndianRupee size={16} color="var(--text-muted)" />
                <input 
                  type="number" 
                  className="input-field" 
                  value={inputs.sipAmount}
                  onChange={(e) => onInputChange('sipAmount', Math.max(0, Number(e.target.value)))}
                />
              </div>
              <input 
                type="range" 
                className="input-slider" 
                min="0" 
                max="100000" 
                step="1000"
                value={inputs.sipAmount}
                onChange={(e) => onInputChange('sipAmount', Number(e.target.value))}
              />
            </div>
          )}

          {/* Returns Expected */}
          <div className="input-group">
            <label>
              <span>Expected SIP Returns (p.a.)</span>
              <span style={{ color: 'var(--text-main)' }}>{inputs.sipRate}%</span>
            </label>
            <div className="input-field-wrapper">
              <Percent size={16} color="var(--text-muted)" />
              <input 
                type="number" 
                className="input-field" 
                value={inputs.sipRate}
                step="0.5"
                onChange={(e) => onInputChange('sipRate', Number(e.target.value))}
              />
            </div>
            <input 
              type="range" 
              className="input-slider" 
              min="2" 
              max="30" 
              step="0.5"
              value={inputs.sipRate}
              onChange={(e) => onInputChange('sipRate', Number(e.target.value))}
            />
          </div>

          {/* SIP Step Up */}
          {!isLotBased && (
            <div className="input-group">
              <label>
                <span>Annual SIP Step-up (%)</span>
                <span style={{ color: 'var(--text-main)' }}>{inputs.stepUpRate}%</span>
              </label>
              <div className="input-field-wrapper">
                <Percent size={16} color="var(--text-muted)" />
                <input 
                  type="number" 
                  className="input-field" 
                  value={inputs.stepUpRate}
                  onChange={(e) => onInputChange('stepUpRate', Math.max(0, Number(e.target.value)))}
                />
              </div>
              <input 
                type="range" 
                className="input-slider" 
                min="0" 
                max="25" 
                step="1"
                value={inputs.stepUpRate}
                onChange={(e) => onInputChange('stepUpRate', Number(e.target.value))}
              />
            </div>
          )}

          {/* FD Amount */}
          {!isLotBased && (
            <div className="input-group">
              <label>
                <span>Monthly Fixed Deposit</span>
                <span style={{ color: 'var(--text-main)' }}>₹{(inputs.fdAmount || 0).toLocaleString()}</span>
              </label>
              <div className="input-field-wrapper">
                <IndianRupee size={16} color="var(--text-muted)" />
                <input 
                  type="number" 
                  className="input-field" 
                  value={inputs.fdAmount}
                  onChange={(e) => onInputChange('fdAmount', Math.max(0, Number(e.target.value)))}
                />
              </div>
              <input 
                type="range" 
                className="input-slider" 
                min="0" 
                max="100000" 
                step="1000"
                value={inputs.fdAmount}
                onChange={(e) => onInputChange('fdAmount', Number(e.target.value))}
              />
            </div>
          )}

          {/* Duration */}
          <div className="input-group">
            <label>
              <span>Investment Horizon</span>
              <span style={{ color: 'var(--text-main)' }}>{inputs.years} Years</span>
            </label>
            <div className="input-field-wrapper">
              <Calendar size={16} color="var(--text-muted)" />
              <input 
                type="number" 
                className="input-field" 
                value={inputs.years}
                onChange={(e) => {
                  const minYears = inputs.assetContext?.lockIn || 1;
                  onInputChange('years', Math.max(minYears, Number(e.target.value)));
                }}
              />
            </div>
            <input 
              type="range" 
              className="input-slider" 
              min={inputs.assetContext?.lockIn || 1} 
              max="40" 
              step="1"
              value={inputs.years}
              onChange={(e) => {
                const minYears = inputs.assetContext?.lockIn || 1;
                onInputChange('years', Math.max(minYears, Number(e.target.value)));
              }}
            />
          </div>

        </div>

        {/* Right Side: Projections Dashboard & Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Numbers Dashboard */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
            <div className="wealth-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Wallet size={14} color="var(--primary)" />
                Total Invested
              </span>
              <h3 style={{ fontSize: '1.35rem', color: 'var(--text-main)', marginTop: '0.5rem' }}>
                {formatCurrency(results.totalInvested)}
              </h3>
            </div>
            <div className="wealth-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <TrendingUp size={14} color="var(--success)" />
                Est. Wealth Gained
              </span>
              <h3 style={{ fontSize: '1.35rem', color: 'var(--success)', marginTop: '0.5rem' }}>
                {formatCurrency(results.totalReturns)}
              </h3>
            </div>
            <div className="wealth-card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Percent size={14} color="#8b5cf6" />
                Absolute Return
              </span>
              <h3 style={{ fontSize: '1.35rem', color: '#8b5cf6', marginTop: '0.5rem' }}>
                {results.totalInvested > 0 ? ((results.totalReturns / results.totalInvested) * 100).toFixed(1) : 0}%
              </h3>
            </div>
          </div>

          <div className="wealth-card" style={{ padding: '1.5rem 1.25rem 1.25rem 0.25rem', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '320px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '1.25rem', marginBottom: '1rem' }}>
              <h4 style={{ color: 'var(--text-main)', fontSize: '1rem' }}>Growth Trajectory Projection</h4>
              <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>
                Total: {formatCurrency(results.totalValue)}
              </span>
            </div>

            <div style={{ flex: 1, width: '100%', height: '100%' }}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="year" stroke="var(--text-muted)" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={formatYAxis} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="invested" name="Invested" stackId="a" fill="var(--primary)" radius={[0, 0, 3, 3]} />
                  <Bar dataKey="returns" name="Growth" stackId="a" fill="var(--success)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

      {/* Under it: Suggestions Grid */}
      <div className="wealth-card" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lightbulb size={18} color="var(--primary)" />
          AI Allocation Suggestions
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {suggestions.map((sug, idx) => {
            const style = getSuggestionStyle(sug.type);
            return (
              <div 
                key={idx} 
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  padding: '1rem',
                  borderRadius: '12px',
                  background: style.bg,
                  borderLeft: style.borderLeft,
                  alignItems: 'flex-start'
                }}
              >
                <div style={{ color: style.color, marginTop: '0.1rem' }}>
                  {sug.icon}
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-main)', fontSize: '0.92rem', marginBottom: '0.2rem', fontWeight: 700 }}>
                    {sug.title}
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.45 }}>
                    {sug.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default WealthCalculator;
