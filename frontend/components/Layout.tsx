import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f3f4f6] text-black font-sans selection:bg-yellow-400 selection:text-black">
      {children}
    </div>
  );
};