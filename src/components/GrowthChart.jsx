import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const total = payload[0].value + payload[1].value;
    
    return (
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.9)', 
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        padding: '1rem',
        backdropFilter: 'blur(8px)',
        boxShadow: 'var(--glass-shadow)',
      }}>
        <p style={{ color: 'var(--text-main)', fontWeight: 'bold', marginBottom: '0.5rem' }}>Year {label}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <p style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>
            Invested: ₹{payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
            Est. Returns: ₹{payload[1].value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <div style={{ height: '1px', background: 'var(--glass-border)', margin: '0.25rem 0' }} />
          <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1rem' }}>
            Total Value: ₹{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const GrowthChart = ({ data }) => {
  const formatYAxis = (value) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(0)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
    return `₹${value}`;
  };

  const formatLabel = (value) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return value > 0 ? `₹${value}` : '';
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.5s', height: '500px', padding: '1.5rem 1.5rem 1.5rem 0' }}>
      <h3 style={{ marginLeft: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Wealth Growth Trajectory</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 40,
            right: 30,
            left: 0,
            bottom: 30,
          }}
          barSize={32}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
          <XAxis 
            dataKey="year" 
            stroke="var(--text-muted)" 
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
          />
          <YAxis 
            stroke="var(--text-muted)" 
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxis}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124, 58, 237, 0.05)' }} />
          <Legend wrapperStyle={{ paddingTop: '10px' }} verticalAlign="bottom" iconType="circle" />
          <Bar 
            dataKey="invested" 
            name="Total Invested" 
            stackId="a" 
            fill="var(--accent)" 
            radius={[0, 0, 4, 4]} 
          />
          <Bar 
            dataKey="returns" 
            name="Est. Returns" 
            stackId="a" 
            fill="var(--secondary)" 
            radius={[4, 4, 0, 0]} 
          >
            <LabelList 
              dataKey="total" 
              position="top" 
              formatter={formatLabel} 
              fill="var(--text-muted)" 
              fontSize={11} 
              fontWeight={500}
              offset={10}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GrowthChart;
