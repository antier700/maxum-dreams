import React from 'react';
import Link from 'next/link';
import './HeroSection.scss';

const HeroSection = () => {
  return (
    <section className="heroSection" id="hero">
      <div className="container">
        <div className="heroRow">
          {/* Left Side - Text Content */}
          <div className="heroContent">
            <span className="badge">Welcome to Maxum Dreams</span>
            <h1 className="title">
              Your Gateway to the <span className="highlight">Future of Digital Assets</span>
            </h1>
            <p className="description">
              Trade with confidence on the world's fastest and most secure platform. Access powerful tools, deep liquidity, and seamless integrations in one unified ecosystem.
            </p>
            <div className="actions">
              <Link href="/login" className="primaryBtn">
                Get Started Now
              </Link>
              <Link href="#features" className="secondaryBtn">
                Explore Features
              </Link>
            </div>
          </div>

          {/* Right Side - Animated Illustration */}
          <div className="heroIllustration">
            <div className="illustrationWrapper">
              {/* Concentric floating circles for abstract tech feel */}
              <div className="circle circle-1"></div>
              <div className="circle circle-2"></div>
              <div className="circle circle-3"></div>
              
              {/* Floating Glass Card with Bar Chart */}
              <div className="glassCard">
                <div className="glassHeader">
                  <div className="circleIcon icon-red"></div>
                  <div className="circleIcon icon-yellow"></div>
                  <div className="circleIcon icon-green"></div>
                </div>
                <div className="line"></div>
                <div className="line short"></div>
                <div className="chart">
                  <div className="bar bar-1"></div>
                  <div className="bar bar-2"></div>
                  <div className="bar bar-3"></div>
                  <div className="bar bar-4"></div>
                  <div className="bar bar-5"></div>
                </div>
                
                {/* Decorative floating element */}
                <div className="floatingBadge">
                  <span>+12.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
