import React from 'react';
import { Lightbulb, TrendingUp, AlertCircle, Info } from 'lucide-react';

const MarketSuggestions = ({ inputs }) => {
  const getSuggestions = () => {
    const suggestions = [];

    // Rate suggestions
    if (inputs.sipRate < 10) {
      suggestions.push({
        type: 'info',
        icon: <TrendingUp size={20} />,
        title: "Conservative SIP Rate",
        text: "Historically, large-cap equity mutual funds in India have yielded around 12-15% over the long term. You might be underestimating your potential SIP returns."
      });
    } else if (inputs.sipRate > 18) {
      suggestions.push({
        type: 'warning',
        icon: <AlertCircle size={20} />,
        title: "Aggressive SIP Rate",
        text: "Expecting returns above 18% consistently is highly aggressive. Consider a more realistic average of 12-15% to avoid shortfall in your financial goals."
      });
    }

    if (inputs.fdRate < 6.5) {
      suggestions.push({
        type: 'info',
        icon: <Lightbulb size={20} />,
        title: "FD Interest Rates",
        text: "Current top bank FDs and small finance banks offer interest rates around 7.0% to 8.0%. You might be able to find better fixed-income options."
      });
    }

    // Allocation suggestions
    const totalMonthly = inputs.sipAmount + inputs.fdAmount;
    if (totalMonthly > 0) {
      const sipPercentage = (inputs.sipAmount / totalMonthly) * 100;
      
      if (inputs.years >= 10 && sipPercentage < 50) {
        suggestions.push({
          type: 'insight',
          icon: <TrendingUp size={20} />,
          title: "Asset Allocation (Long Term)",
          text: "Since your horizon is long (10+ years), you have a conservative portfolio. To effectively beat inflation, consider allocating a larger percentage (> 60%) to Equity SIPs."
        });
      } else if (inputs.years < 5 && sipPercentage > 70) {
        suggestions.push({
          type: 'warning',
          icon: <AlertCircle size={20} />,
          title: "Asset Allocation (Short Term)",
          text: "Equity SIPs can be volatile in the short term (< 5 years). Ensure you have adequate allocation to FDs or Debt funds for short-term liquidity and safety."
        });
      }
    }

    if (suggestions.length === 0) {
      suggestions.push({
        type: 'success',
        icon: <Info size={20} />,
        title: "Balanced Portfolio",
        text: "Your current input values represent a balanced and realistic expectation based on standard market conditions."
      });
    }

    return suggestions;
  };

  const suggestions = getSuggestions();

  const getColor = (type) => {
    switch(type) {
      case 'warning': return 'var(--secondary)'; // Pinkish red
      case 'insight': return 'var(--primary)'; // Purple
      case 'success': return '#10b981'; // Green
      default: return 'var(--accent)'; // Blue
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.6s', padding: '1.5rem', marginTop: '2rem' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
        <Lightbulb color="var(--primary)" />
        Smart Market Suggestions
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {suggestions.map((suggestion, index) => (
          <div 
            key={index} 
            style={{
              display: 'flex',
              gap: '1rem',
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '12px',
              borderLeft: `4px solid ${getColor(suggestion.type)}`
            }}
          >
            <div style={{ color: getColor(suggestion.type), marginTop: '0.1rem' }}>
              {suggestion.icon}
            </div>
            <div>
              <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: '0.25rem', fontWeight: 600 }}>
                {suggestion.title}
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {suggestion.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketSuggestions;
