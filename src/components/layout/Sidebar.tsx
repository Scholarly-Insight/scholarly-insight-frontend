import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ScholarlyLogo from '../ui/ScholarlyLogo';
import {
  FaHome, FaSearch, FaBookmark, FaHistory,
  FaBell, FaCog, FaBook, FaUserCircle, FaChevronDown, FaChevronRight, FaRocketchat
} from 'react-icons/fa';

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
}

// Available categories for sidebar navigation
const CATEGORIES = [
  { id: 'cs.AI', name: 'Artificial Intelligence' },
  { id: 'cs.CL', name: 'Computation and Language' },
  { id: 'cs.CV', name: 'Computer Vision' },
  { id: 'cs.LG', name: 'Machine Learning' },
  { id: 'cs.NE', name: 'Neural and Evolutionary Computing' },
  { id: 'cs.RO', name: 'Robotics' },
  { id: 'cs.DL', name: 'Digital Libraries' },
  { id: 'cs.SE', name: 'Software Engineering' },
  { id: 'math.ST', name: 'Statistics Theory' },
  { id: 'physics.med-ph', name: 'Medical Physics' },
  { id: 'q-bio', name: 'Quantitative Biology' },
];

const Sidebar: React.FC<SidebarProps> = ({
  className = '',
  collapsed = false,
}) => {
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

  const toggleCategories = () => {
    setCategoriesExpanded(!categoriesExpanded);
  };

  return (
    <aside className={`bg-scholarly-sidebar border-r border-scholarly-borderColor flex flex-col h-full ${className} ${collapsed ? 'w-16' : 'w-72'} transition-all duration-200 ease-in-out`}>
      <div className="flex items-center p-4">
        {!collapsed && <ScholarlyLogo withText={true} className="flex-1" />}
      </div>

      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1 p-2">
          <li>
            <Link
              to="/"
              className="flex items-center gap-3 p-2 rounded-lg text-scholarly-text hover:bg-scholarly-hoverBg"
            >
              <FaHome size={collapsed ? 20 : 16} />
              {!collapsed && <span>Home</span>}
            </Link>
          </li>
          <li>
            <Link
              to="/search"
              className="flex items-center gap-3 p-2 rounded-lg text-scholarly-text hover:bg-scholarly-hoverBg"
            >
              <FaSearch size={collapsed ? 20 : 16} />
              {!collapsed && <span>Search</span>}
            </Link>
          </li>
          <li>
            <Link
              to="/discussion"
              className="flex items-center gap-3 p-2 rounded-lg text-scholarly-text hover:bg-scholarly-hoverBg"
            >
              <FaRocketchat size={collapsed ? 20 : 16} />
              {!collapsed && <span>Discussion</span>}
            </Link>
          </li>
          <li>
            <button
              onClick={toggleCategories}
              className="flex items-center justify-between w-full gap-3 p-2 rounded-lg text-scholarly-text hover:bg-scholarly-hoverBg"
            >
              <div className="flex items-center gap-3">
                <FaBook size={collapsed ? 20 : 16} />
                {!collapsed && <span>Categories</span>}
              </div>
              {!collapsed && (
                categoriesExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />
              )}
            </button>

            {!collapsed && categoriesExpanded && (
              <ul className="mt-1 ml-8 space-y-1">
                {CATEGORIES.map(category => (
                  <li key={category.id}>
                    <Link
                      to={`/search?category=${category.id}`}
                      className="flex items-center p-2 text-sm text-scholarly-secondaryText hover:text-scholarly-primary"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
          <li className="py-2">
            <div className="border-t border-scholarly-borderColor"></div>
          </li>
          <li>
            <Link
              to="/favorites"
              className="flex items-center gap-3 p-2 rounded-lg text-scholarly-text hover:bg-scholarly-hoverBg"
            >
              <FaBookmark size={collapsed ? 20 : 16} />
              {!collapsed && <span>Favorites</span>}
            </Link>
          </li>
          <li>
            <Link
              to="/history"
              className="flex items-center gap-3 p-2 rounded-lg text-scholarly-text hover:bg-scholarly-hoverBg"
            >
              <FaHistory size={collapsed ? 20 : 16} />
              {!collapsed && <span>Reading History</span>}
            </Link>
          </li>
          <li>
            <Link
              to="/alerts"
              className="flex items-center gap-3 p-2 rounded-lg text-scholarly-text hover:bg-scholarly-hoverBg"
            >
              <FaBell size={collapsed ? 20 : 16} />
              {!collapsed && <span>Alerts</span>}
            </Link>
          </li>
          <li className="py-2">
            <div className="border-t border-scholarly-borderColor"></div>
          </li>
          <li>
            <Link
              to="/profile"
              className="flex items-center gap-3 p-2 rounded-lg text-scholarly-text hover:bg-scholarly-hoverBg"
            >
              <FaUserCircle size={collapsed ? 20 : 16} />
              {!collapsed && <span>Profile</span>}
            </Link>
          </li>
          <li>
            <Link
              to="/settings"
              className="flex items-center gap-3 p-2 rounded-lg text-scholarly-text hover:bg-scholarly-hoverBg"
            >
              <FaCog size={collapsed ? 20 : 16} />
              {!collapsed && <span>Settings</span>}
            </Link>
          </li>
        </ul>
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-scholarly-borderColor">
          <p className="text-xs text-scholarly-secondaryText">
            © 2025 Scholarly Insight
          </p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
