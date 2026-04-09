import React from 'react';
import './HeroFeature.scss';
import { FastIcon, IntegrationIcon, SecurityIcon } from '@/assets/icons/svgIcon';

const HeroFeature = () => {
  const features = [
    {
      id: 1,
      title: 'Lightning Fast',
      description: 'Experience ultra-fast execution times with our optimized infrastructure designed for high-frequency trading.',
      icon: <FastIcon />
    },
    {
      id: 2,
      title: 'Secure & Reliable',
      description: 'Your assets are protected with industry-leading security protocols and robust encryption standards.',
      icon: <SecurityIcon />
    },
    {
      id: 3,
      title: 'Seamless Integration',
      description: 'Easily connect with advanced tools and APIs to enhance your trading strategies and portfolio management.',
      icon: <IntegrationIcon />
    }
  ];

  return (
    <section className="heroFeatureSection" id="features">
      <div className="container">
        <div className="sectionHeader">
          <span className="subTitle">Our Features</span>
          <h2 className="title">Why Choose Maxum Dreams</h2>
          <p className="description">
            Discover the powerful features that make our platform the ideal choice for your digital asset journey.
          </p>
        </div>

        <div className="featureGrid">
          {features.map((feature) => (
            <div key={feature.id} className="featureCard">
              <div className="iconWrapper">
                {feature.icon}
              </div>
              <h3 className="cardTitle">{feature.title}</h3>
              <p className="cardDesc">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroFeature;
