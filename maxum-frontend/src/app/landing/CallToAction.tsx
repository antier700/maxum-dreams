import React from 'react';
import Link from 'next/link';
import './CallToAction.scss';
import { BiometricIcon } from '@/assets/icons/svgIcon';

const CallToAction = () => {
  return (
    <section className="ctaSection" id="cta">
      <div className="container">
        <div className="ctaContainer">
          <div className="ctaContent">
            <div className="iconWrapper">
              {/* Using BiometricIcon or another decorative icon to signify security/readiness */}
              <BiometricIcon />
            </div>
            <h2 className="ctaTitle">Ready to Start Your Journey?</h2>
            <p className="ctaDesc">
              Join thousands of users and experience the next generation of digital asset trading. Safe, secure, and lightning fast.
            </p>
            <div className="ctaButtons">
              <Link href="/login" className="primaryBtn">
                Get Started
              </Link>
              <Link href="/about" className="secondaryBtn">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
