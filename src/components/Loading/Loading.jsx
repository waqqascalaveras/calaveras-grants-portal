import React, { useEffect, useState } from 'react';
import './Loading.css';

const Loading = () => {
  const [dollarSigns, setDollarSigns] = useState([]);
  
  useEffect(() => {
    // Generate dollar signs periodically
    const interval = setInterval(() => {
      const newSign = {
        id: Date.now() + Math.random(),
        line: Math.floor(Math.random() * 24), // 24 lines total
        delay: Math.random() * 0.5,
        size: Math.random() * 0.5 + 0.7 // 0.7 - 1.2 scale
      };
      
      setDollarSigns(prev => [...prev, newSign]);
      
      // Remove after animation completes
      setTimeout(() => {
        setDollarSigns(prev => prev.filter(s => s.id !== newSign.id));
      }, 2200);
    }, 140);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="loading-container">
      <div className="orbital-system">
        {/* First orbital center with clockwise spinning lines */}
        <div className="orbit-center orbit-1">
          <div className="spinning-lines clockwise">
            {[...Array(12)].map((_, i) => (
              <div
                key={`cw-${i}`}
                className="radial-line"
                style={{
                  transform: `rotate(${i * 30}deg)`,
                  animationDelay: `${i * 0.05}s`
                }}
              >
                <div className="line-glow"></div>
              </div>
            ))}
          </div>
          <div className="center-dot"></div>
        </div>
        
        {/* Second orbital center with counter-clockwise spinning lines */}
        <div className="orbit-center orbit-2">
          <div className="spinning-lines counter-clockwise">
            {[...Array(12)].map((_, i) => (
              <div
                key={`ccw-${i}`}
                className="radial-line"
                style={{
                  transform: `rotate(${i * 30}deg)`,
                  animationDelay: `${i * 0.05}s`
                }}
              >
                <div className="line-glow"></div>
              </div>
            ))}
          </div>
          <div className="center-dot"></div>
        </div>
        
        {/* Animated dollar signs */}
        {dollarSigns.map(sign => (
          <div
            key={sign.id}
            className="dollar-sign"
            style={{
              '--line-angle': `${sign.line * 15}deg`,
              '--delay': `${sign.delay}s`,
              '--size': sign.size
            }}
          >
            $
          </div>
        ))}
      </div>
      
      <div className="loading-text">
        <h3>Loading Grant Opportunities</h3>
        <p>Fetching California & Federal grants...</p>
      </div>
    </div>
  );
};

export default Loading;