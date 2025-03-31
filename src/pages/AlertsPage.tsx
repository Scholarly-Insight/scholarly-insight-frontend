import React from 'react';
import { Link } from 'react-router-dom';

const AlertsPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Your Alerts</h1>

      <div className="bg-white rounded-lg shadow-scholarly-card p-6 mb-6">
        <p className="text-scholarly-secondaryText">
          Alerts page is under construction. Come back soon!
        </p>

        <div className="flex gap-4 mt-4">
          <Link
            to="/profile"
            className="text-scholarly-primary hover:underline"
          >
            Back to Profile
          </Link>

          <Link
            to="/"
            className="text-scholarly-primary hover:underline"
          >
            Browse Articles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;
