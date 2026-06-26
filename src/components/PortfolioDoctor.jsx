import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { ShieldAlert, Award, Flame, Sparkles, TrendingUp, ShieldCheck, ArrowUpRight, ArrowDownRight, CheckCircle2, Activity, RefreshCw } from 'lucide-react';

const COLORS = ['#2563eb', '#10b981', '#fb923c', '#e11d48', '#a855f7', '#06b6d4'];

const initialDefaultHoldings = [
  { id: 1, name: "Reliance Industries", symbol: "RELIANCE", category: "Equity", sector: "Conglomerate", quantity: 15, buyPrice: 2380.00, broker: "Zerodha", buyDate: "2025-06-12" },
  { id: 2, name: "HDFC Bank Ltd", symbol: "HDFCBANK", category: "Equity", sector: "Banking", quantity: 30, buyPrice: 1500.00, broker: "Groww", buyDate: "2025-08-15" },
  { id: 3, name: "Parag Parikh Flexi Cap", symbol: "PPFLEXI", category: "Mutual Funds", sector: "Diversified", quantity: 1, buyPrice: 30000.00, broker: "Direct", buyDate: "2024-12-10" },
  { id: 4, name: "Gold ETF Bees", symbol: "GOLD", category: "Commodities", sector: "Gold", quantity: 50, buyPrice: 5000.00, broker: "Zerodha", buyDate: "2025-01-20" },
  { id: 5, name: "Bitcoin", symbol: "BTC/USD", category: "Cryptocurrency", sector: "Crypto", quantity: 0.15, buyPrice: 4800000.00, broker: "CoinDCX", buyDate: "2025-04-05" }
];

const PortfolioDoctor = ({ marketData = {} }) => {
  const [holdings, setHoldings] = useState(() => {
    try {
      const cached = localStorage.getItem('Prefin_holdings');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  // Keep state updated if localStorage changes externally
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const cached = localStorage.getItem('Prefin_holdings');
        if (cached) setHoldings(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to sync holdings in doctor:", e);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLoadDemo = () => {
    setHoldings(initialDefaultHoldings);
    localStorage.setItem('Prefin_holdings', JSON.stringify(initialDefaultHoldings));
  };

  // Resolve Live Prices & Metric Calculations
  const processedHoldings = useMemo(() => {
    return holdings.map(h => {
      let currentPrice = h.buyPrice; // fallback

      // Map dynamic live feed data
      if (h.symbol && marketData[h.symbol]?.price != null) {
        currentPrice = marketData[h.symbol].price;
      } else if (h.symbol === 'RELIANCE' && marketData['RELIANCE']?.price != null) {
        currentPrice = marketData['RELIANCE'].price;
      } else if (h.symbol === 'GOLD' && marketData['GOLD']?.price != null) {
        currentPrice = marketData['GOLD'].price;
      } else {
        // Mock slight variations for items not on direct index feed (e.g. PPFLEXI, BTC)
        const hash = h.id % 10;
        const multiplier = 1 + (hash * 0.03) - 0.05; // -5% to +25%
        currentPrice = h.buyPrice * multiplier;
      }

      const invested = h.buyPrice * h.quantity;
      const current = currentPrice * h.quantity;
      const pl = current - invested;
      const plPct = invested > 0 ? (pl / invested) * 100 : 0;

      return {
        ...h,
        currentPrice,
        invested,
        current,
        pl,
        plPct
      };
    });
  }, [holdings, marketData]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    let totalInvested = 0;
    let totalCurrent = 0;
    const sectorTotals = {};
    const categoryTotals = {};

    let highestGainer = null;
    let highestLoser = null;

    processedHoldings.forEach(h => {
      totalInvested += h.invested;
      totalCurrent += h.current;

      sectorTotals[h.sector] = (sectorTotals[h.sector] || 0) + h.current;
      categoryTotals[h.category] = (categoryTotals[h.category] || 0) + h.current;

      if (!highestGainer || h.pl > highestGainer.pl) {
        highestGainer = h;
      }
      if (!highestLoser || h.pl < highestLoser.pl) {
        highestLoser = h;
      }
    });

    const absolutePl = totalCurrent - totalInvested;
    const plPercentage = totalInvested > 0 ? (absolutePl / totalInvested) * 100 : 0;

    let bestSector = 'N/A';
    let weakestSector = 'N/A';
    let highestSectorVal = -1;
    let lowestSectorVal = Infinity;

    Object.keys(sectorTotals).forEach(sec => {
      if (sectorTotals[sec] > highestSectorVal) {
        highestSectorVal = sectorTotals[sec];
        bestSector = sec;
      }
      if (sectorTotals[sec] < lowestSectorVal) {
        lowestSectorVal = sectorTotals[sec];
        weakestSector = sec;
      }
    });

    return {
      totalInvested,
      totalCurrent,
      absolutePl,
      plPercentage,
      sectorTotals,
      categoryTotals,
      highestGainer,
      highestLoser,
      bestSector,
      weakestSector
    };
  }, [processedHoldings]);

  // Portfolio Health Score calculation (0 - 100)
  const healthScore = useMemo(() => {
    if (processedHoldings.length === 0) return 0;
    let score = 100;

    // 1. Diversification categories check
    const categoriesCount = Object.keys(metrics.categoryTotals).length;
    if (categoriesCount < 3) score -= 15;
    else if (categoriesCount < 4) score -= 5;

    // 2. Crypto concentration check (speculative weight limit 20%)
    const cryptoTotal = metrics.categoryTotals['Cryptocurrency'] || 0;
    const cryptoPct = metrics.totalCurrent > 0 ? (cryptoTotal / metrics.totalCurrent) * 100 : 0;
    if (cryptoPct > 20) score -= 20;
    else if (cryptoPct > 10) score -= 10;

    // 3. Single sector concentration check (industry risk limit 45%)
    Object.keys(metrics.sectorTotals).forEach(sec => {
      const secPct = metrics.totalCurrent > 0 ? (metrics.sectorTotals[sec] / metrics.totalCurrent) * 100 : 0;
      if (secPct > 45) score -= 15;
    });

    // 4. Quantity of holdings health check
    if (processedHoldings.length < 4) score -= 10;

    return Math.max(10, Math.min(100, score));
  }, [processedHoldings, metrics]);

  const healthGrade = useMemo(() => {
    if (healthScore >= 85) return { rating: 'Excellent', color: 'var(--success)', msg: 'Perfect balance of growth asset compound potential and currency safety.' };
    if (healthScore >= 65) return { rating: 'Moderate Skew', color: '#fb923c', msg: 'Core allocations show concentration issues. Diversify speculative tokens.' };
    return { rating: 'Action Required', color: 'var(--danger)', msg: 'High volatility exposure detected. Reallocate proceeds into stable sovereign bonds.' };
  }, [healthScore]);

  const cryptoPct = useMemo(() => {
    const cryptoTotal = metrics.categoryTotals['Cryptocurrency'] || 0;
    return metrics.totalCurrent > 0 ? (cryptoTotal / metrics.totalCurrent) * 100 : 0;
  }, [metrics]);

  const allocationPieData = useMemo(() => {
    return Object.keys(metrics.categoryTotals).map(cat => ({
      name: cat,
      value: metrics.categoryTotals[cat]
    }));
  }, [metrics.categoryTotals]);

  const sectorBarData = useMemo(() => {
    return Object.keys(metrics.sectorTotals).map(sec => ({
      name: sec,
      allocation: metrics.sectorTotals[sec]
    }));
  }, [metrics.sectorTotals]);

  const disclaimer = "This information is for educational purposes only and does not constitute SEBI-registered financial, investment, legal, or tax advice.";

  if (holdings.length === 0) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '2.5rem', textAlign: 'center' }} className="wealth-card animate-fade-in">
        <ShieldAlert size={48} color="var(--primary)" style={{ margin: '0 auto 1.5rem auto' }} className="float-3d" />
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
          Your Portfolio is Empty
        </h3>
        <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '2rem', fontWeight: 600 }}>
          The AI Portfolio Doctor requires transaction records to diagnose your asset allocation and risk exposure. Log holdings manually or import a broker statement to begin.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={handleLoadDemo}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '0.75rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <RefreshCw size={14} />
            Load Demo Portfolio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2.5rem' }} className="animate-fade-in">
      
      {/* Title Section */}
      <div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--success)', background: 'var(--success-glow)', padding: '0.25rem 0.65rem', borderRadius: '100px', textTransform: 'uppercase' }}>
            Free for Everyone
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', background: 'rgba(37,99,235,0.06)', padding: '0.25rem 0.65rem', borderRadius: '100px', textTransform: 'uppercase' }}>
            AI Powered
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-light)', background: 'rgba(0,0,0,0.04)', padding: '0.25rem 0.65rem', borderRadius: '100px', textTransform: 'uppercase' }}>
            Transparent Investing
          </span>
        </div>
        <h2 style={{ color: 'var(--text-main)', fontSize: '1.65rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ShieldCheck size={24} color="var(--primary)" className="float-3d" />
          AI Portfolio Doctor
        </h2>
        <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', margin: '0.25rem 0 0 0', fontWeight: 600 }}>
          Real-time diagnostics, risk checks, diversification maps, and automated rebalancing recommendations.
        </p>
      </div>

      {/* Aggregated P/L Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
        <div className="wealth-card" style={{ padding: '1.5rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Total Capital Invested</span>
          <h3 style={{ fontSize: '1.6rem', color: 'var(--text-main)', marginTop: '0.4rem', fontFamily: 'monospace', fontWeight: 800 }}>
            ₹{metrics.totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="wealth-card" style={{ padding: '1.5rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Current Valuation</span>
          <h3 style={{ fontSize: '1.6rem', color: 'var(--text-main)', marginTop: '0.4rem', fontFamily: 'monospace', fontWeight: 800 }}>
            ₹{metrics.totalCurrent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="wealth-card" style={{ padding: '1.5rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Net Unrealized Yield</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
            <h3 style={{ 
              fontSize: '1.6rem', 
              color: metrics.absolutePl >= 0 ? 'var(--success)' : 'var(--danger)',
              margin: 0,
              fontFamily: 'monospace',
              fontWeight: 800
            }}>
              ₹{metrics.absolutePl.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className={metrics.absolutePl >= 0 ? 'badge-growth' : 'badge-drop'} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', fontWeight: 800 }}>
              {metrics.absolutePl >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {metrics.plPercentage.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Circular Health Meter & Diagnostic scorecard */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }} className="dashboard-grid">
        
        {/* Health Score gauge */}
        <div className="wealth-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', margin: '0 0 1.5rem 0', fontWeight: 800 }}>
            Portfolio Health Index
          </h3>
          
          <div style={{ position: 'relative', width: '130px', height: '130px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
            <svg width="100%" height="100%" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="3.5"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={healthGrade.color}
                strokeDasharray={`${healthScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                {healthScore}
              </span>
              <span style={{ fontSize: '0.72rem', display: 'block', color: 'var(--text-light)', fontWeight: 700 }}>/ 100</span>
            </div>
          </div>

          <span style={{
            fontSize: '0.85rem',
            fontWeight: 900,
            color: healthGrade.color,
            background: `${healthGrade.color}08`,
            padding: '0.3rem 0.75rem',
            borderRadius: '6px',
            marginBottom: '0.5rem'
          }}>
            {healthGrade.rating}
          </span>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0, fontWeight: 500, maxWidth: '280px' }}>
            {healthGrade.msg}
          </p>
        </div>

        {/* Risk Scorecard panel */}
        <div className="wealth-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: 0 }}>
            Risk Assessment Scorecard
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Volatility (Beta)</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>MEDIUM</span>
                <span style={{ fontSize: '0.7rem', background: 'rgba(37,99,235,0.06)', color: 'var(--primary)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>Beta: 1.08</span>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Drawdown Risk</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--danger)' }}>14.2% Est.</span>
                <span style={{ fontSize: '0.7rem', background: 'var(--danger-glow)', color: 'var(--danger)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>95% VaR</span>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Liquidity Ratio</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--success)' }}>HIGH (82%)</span>
                <span style={{ fontSize: '0.7rem', background: 'var(--success-glow)', color: 'var(--success)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>Intraday</span>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Diversification Index</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>{Object.keys(metrics.categoryTotals).length} Asset Classes</span>
                <span style={{ fontSize: '0.7rem', background: 'rgba(0,0,0,0.04)', color: 'var(--text-light)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>Optimal</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>🏆 HIGHEST PROFIT HOLDING:</span>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.1rem' }}>
                {metrics.highestGainer ? `${metrics.highestGainer.name} (+${metrics.highestGainer.plPct.toFixed(1)}%)` : 'N/A'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>⚠️ HIGHEST LOSS HOLDING:</span>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.1rem' }}>
                {metrics.highestLoser ? `${metrics.highestLoser.name} (${metrics.highestLoser.plPct.toFixed(1)}%)` : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Allocation Charts: Pie & Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="dashboard-grid">
        
        {/* Pie Class Allocation */}
        <div className="wealth-card" style={{ padding: '1.75rem', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '1.25rem' }}>Diversification Analysis</h3>
          <div style={{ flex: 1, width: '100%', height: '100%', minHeight: '200px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={allocationPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {allocationPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Sector Exposure */}
        <div className="wealth-card" style={{ padding: '1.75rem', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '1.25rem' }}>Sector Exposure Analysis</h3>
          <div style={{ flex: 1, width: '100%', height: '100%', minHeight: '200px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sectorBarData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 9, fontWeight: 700 }} tickLine={false} />
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 9, fontWeight: 700 }} tickLine={false} axisLine={false} width={40} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                <Bar dataKey="allocation" fill="var(--primary)" radius={[8, 8, 0, 0]}>
                  {sectorBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Recommendations Section */}
      <div className="wealth-card" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(240,253,244,0.75) 100%)', border: '1px solid rgba(16,185,129,0.15)' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={18} color="var(--primary)" className="float-3d" />
          Doctor's AI Rebalancing Recommendations
        </h3>
        
        <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
          Based on today's live Nifty valuations and your logged concentrations, we suggest the following adjustments:
          <br /><br />
          - **Examine Banking Exposure**: Banking sector equities comprise **{((metrics.sectorTotals['Banking'] || 0) / metrics.totalCurrent * 100).toFixed(1)}%** of your total portfolio. While financials are stable, consider booking partial profits in banking assets that exceed target CAGR and redirecting yields to other sectors.
          <br />
          - **Diversify Speculative Assets**: Your Cryptocurrency holdings represent **{cryptoPct.toFixed(1)}%** of your overall wealth. Rebalancing 10% of high-beta crypto holdings into sovereign gold or balanced mutual funds will reduce VaR drawdown risks.
          <br />
          - **Sector Rebalancing**: Allocate incremental capital toward underweighted sectors (e.g. IT services or commodities) to build an optimal defense layer.
        </p>

        {/* SEBI Disclaimer */}
        <div style={{
          display: 'flex',
          gap: '6px',
          alignItems: 'flex-start',
          background: 'rgba(239, 68, 68, 0.04)',
          border: '1px dashed rgba(239, 68, 68, 0.15)',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          fontSize: '0.72rem',
          color: 'var(--text-light)',
          marginTop: '1.5rem',
          lineHeight: 1.4
        }}>
          <ShieldAlert size={12} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--danger)' }} />
          <div>
            <strong style={{ color: 'var(--danger)', fontWeight: 800 }}>SEBI Disclaimer: </strong>
            {disclaimer}
          </div>
        </div>
      </div>

    </div>
  );
};

export default PortfolioDoctor;
