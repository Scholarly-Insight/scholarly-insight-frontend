import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="text-8xl font-bold text-scholarly-primary mb-6">404</h1>
      <h2 className="text-3xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-lg text-scholarly-secondaryText mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      <Link
        to="/"
        className="inline-block bg-scholarly-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-scholarly-primary/90 transition-colors"
      >
        Return to Home Page
      </Link>
    </div>
  );
};

export default NotFoundPage;
