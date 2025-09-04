import React from 'react';
import Header from './Header';
import ApiStatusPanel from '../ui/ApiStatusPanel';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>{children}</main>
      <ApiStatusPanel />
    </div>
  );
};

export default Layout;