'use client';
import { useState, useEffect } from 'react';
import WebVitals from './web-vitals';

export default function ClientLayoutFeatures() {
  const [highContrast, setHighContrast] = useState(false);
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  return (
    <>
      <WebVitals />
      {/* <button
                onClick={() => setHighContrast((v) => !v)}
                className="skip-to-content-link"
                aria-label="Toggle high contrast mode"
            >
                Toggle High Contrast
            </button>
            <a href="#main-content" className="skip-to-content-link">
                Skip to main content
            </a> */}
    </>
  );
}
