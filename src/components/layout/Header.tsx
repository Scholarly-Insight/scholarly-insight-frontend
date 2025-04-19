import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MenuIcon } from '../icons/Icons';
import Button from '../ui/Button';
import ScholarlyLogo from '../ui/ScholarlyLogo';
import { FaSearch, FaUser, FaRegBell, FaRegBookmark, FaHistory } from 'react-icons/fa';

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
  const [isAuthenticated] = useState(false); // This would come from authentication context in a real app

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

      <div className="flex items-center space-x-2">
        {isAuthenticated ? (
          <>
            <Link
              to="/favorites"
              className="p-2 rounded-full text-scholarly-secondaryText hover:bg-scholarly-hoverBg"
              aria-label="Favorites"
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
            <Link
              to="/profile"
              className="p-2 rounded-full text-scholarly-secondaryText hover:bg-scholarly-hoverBg"
              aria-label="Profile"
            >
              <FaUser />
            </Link>
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
