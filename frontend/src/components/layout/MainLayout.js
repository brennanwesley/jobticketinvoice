import React from 'react';
import { HelpButton } from '../ui';

/**
 * MainLayout - Main layout component that wraps the application content
 * and includes persistent UI elements like the HelpButton
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {React.ReactElement} The MainLayout component
 */
const MainLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen">
      {/* Main content */}
      {children}
      
      {/* Persistent Help Button */}
      <HelpButton />
    </div>
  );
};

export default MainLayout;
