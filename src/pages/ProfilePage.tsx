import React from 'react';
import { Link } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      <div className="bg-white rounded-lg shadow-scholarly-card p-6 mb-6">
        <p className="text-scholarly-secondaryText">
          Profile page is under construction. Come back soon!
        </p>

        <div className="flex gap-4 mt-4">
          <Link
            to="/favorites"
            className="text-scholarly-primary hover:underline"
          >
            My Favorites
          </Link>

          <Link
            to="/history"
            className="text-scholarly-primary hover:underline"
          >
            Reading History
          </Link>

          <Link
            to="/alerts"
            className="text-scholarly-primary hover:underline"
          >
            My Alerts
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
