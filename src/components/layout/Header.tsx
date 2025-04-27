import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MenuIcon } from '../icons/Icons';
import Button from '../ui/Button';
import ScholarlyLogo from '../ui/ScholarlyLogo';
import { FaSearch, FaUser, FaRegBell, FaRegBookmark, FaHistory } from 'react-icons/fa';
import { signOut } from '../../services/firebase';

interface HeaderProps {
  onToggleSidebar: () => void;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  className = '',
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    setIsAuthenticated(token !== null);
  }, []);

  // Add a listener for storage events to detect when a user signs in or out in another tab
  useEffect(() => {
    // Function to check authentication status
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(token !== null);
    };
    
    // Create a custom event for auth state changes within the same tab
    window.addEventListener('storage', (event) => {
      if (event.key === 'token') {
        checkAuthStatus();
      }
    });
    
    // Also listen for a custom event we'll dispatch when auth changes in the same tab
    window.addEventListener('authStateChanged', checkAuthStatus);
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('authStateChanged', checkAuthStatus);
    };
  }, []);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setProfileMenuOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setProfileMenuOpen(false);
    }, 500); // 500ms delay before closing
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsAuthenticated(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className={`flex items-center justify-between px-4 py-3 border-b border-scholarly-borderColor bg-white ${className}`}>
      <div className="flex items-center">
        <button
          onClick={onToggleSidebar}
          className="p-2 mr-3 rounded-full text-scholarly-secondaryText hover:bg-scholarly-hoverBg"
          aria-label="Toggle sidebar"
        >
          <MenuIcon size={20} />
        </button>
        <Link to="/" className="flex items-center">
          <ScholarlyLogo className="md:hidden" />
        </Link>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="hidden md:flex flex-1 max-w-xl mx-4"
      >
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search for papers, authors, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 px-4 pr-10 border border-scholarly-borderColor rounded-full focus:outline-none focus:ring-2 focus:ring-scholarly-primary"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-scholarly-secondaryText hover:text-scholarly-primary"
          >
            <FaSearch />
          </button>
        </div>
      </form>

      <div className="flex items-center space-x-1 -mr-6 transform -translate-x-4">
        {isAuthenticated ? (
          <>
            <Link
              to="/saved"
              className="p-2 rounded-full text-scholarly-secondaryText hover:bg-scholarly-hoverBg"
              aria-label="Saved"
            >
              <FaRegBookmark />
            </Link>
            <Link
              to="/history"
              className="p-2 rounded-full text-scholarly-secondaryText hover:bg-scholarly-hoverBg"
              aria-label="Reading history"
            >
              <FaHistory />
            </Link>
            <Link
              to="/alerts"
              className="p-2 rounded-full text-scholarly-secondaryText hover:bg-scholarly-hoverBg"
              aria-label="Notifications"
            >
              <FaRegBell />
            </Link>
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                to="/profile"
                className="p-2 rounded-full text-scholarly-secondaryText hover:bg-scholarly-hoverBg"
                aria-label="Profile"
              >
                <FaUser />
              </Link>
              {profileMenuOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-1 min-w-[180px] bg-white border border-scholarly-borderColor rounded-md shadow-md z-50 animate-fade-in">
                  <Link to="/profile" className="block px-4 py-2 text-scholarly-text hover:bg-scholarly-hoverBg">Profile</Link>
                  <Link to="/settings" className="block px-4 py-2 text-scholarly-text hover:bg-scholarly-hoverBg">Settings</Link>
                  <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-scholarly-text hover:bg-scholarly-hoverBg">Sign out</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/auth">
            <Button variant="primary">
              Sign in
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
