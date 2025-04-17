// File: src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

function Navbar() {
  const location = useLocation();
  const { userId } = useAppContext();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-indigo-700' : '';
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">PDF-to-Podcast</Link>
          
          <div className="flex space-x-4">
            {userId && (
              <>
                <Link 
                  to="/" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}
                >
                  Upload
                </Link>
                <Link 
                  to="/jobs" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/jobs')}`}
                >
                  Jobs
                </Link>
                <Link 
                  to="/settings" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/settings')}`}
                >
                  Settings
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
