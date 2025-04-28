import React, { useEffect } from 'react';
import './PageTransition.css';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-transition">
      {children}
    </div>
  );
};

export default PageTransition; 