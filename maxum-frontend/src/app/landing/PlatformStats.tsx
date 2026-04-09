import React from 'react';
import './PlatformStats.scss';

const PlatformStats = () => {
  const stats = [
    {
      id: 1,
      value: '$2.5B+',
      label: 'Trading Volume'
    },
    {
      id: 2,
      value: '350+',
      label: 'Trading Pairs'
    },
    {
      id: 3,
      value: '99.9%',
      label: 'Uptime'
    },
    {
      id: 4,
      value: '2M+',
      label: 'Active Users'
    }
  ];

  return (
    <section className="platformStatsSection" id="stats">
      <div className="container">
        <div className="statsGrid">
          {stats.map((stat) => (
            <div key={stat.id} className="statItem">
              <h3 className="statValue">{stat.value}</h3>
              <p className="statLabel">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformStats;
