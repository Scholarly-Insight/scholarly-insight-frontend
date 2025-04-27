import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Article {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  date: string;
  source: string;
}

const SavedPage: React.FC = () => {
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSavedArticles = () => {
      try {
        const saved = localStorage.getItem('savedArticles');
        if (saved) {
          const parsedData = JSON.parse(saved);
          setSavedArticles(Array.isArray(parsedData) ? parsedData : []);
        } else {
          setSavedArticles([]);
        }
      } catch (error) {
        console.error("Error loading saved articles:", error);
        setSavedArticles([]);
      } finally {
        setLoading(false);
      }
    };

    loadSavedArticles();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'savedArticles') {
        loadSavedArticles();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Your Saved Articles</h1>
        <div className="bg-white rounded-lg shadow-scholarly-card p-6 mb-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-scholarly-primary border-t-transparent"></div>
          <p className="mt-4 text-scholarly-secondaryText">Loading your saved articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Your Saved Articles</h1>
      <div className="bg-white rounded-lg shadow-scholarly-card p-6 mb-6">
        {savedArticles.length === 0 ? (
          <p className="text-scholarly-secondaryText mb-4">No saved articles yet. Go to an article and click "Save" to add it here!</p>
        ) : (
          <ul className="divide-y divide-scholarly-borderColor">
            {savedArticles.map(article => (
              <li key={article.id} className="py-4">
                <Link to={`/article/${article.id}`} className="font-semibold text-scholarly-primary hover:underline text-lg">
                  {article.title}
                </Link>
                <div className="text-scholarly-secondaryText text-sm mb-1">
                  {article.authors.join(', ')} • {article.date}
                </div>
                <div className="text-scholarly-text text-sm">
                  {article.abstract.length > 200 ? article.abstract.substring(0, 200) + '...' : article.abstract}
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-4 mt-6">
          <Link to="/profile" className="text-scholarly-primary hover:underline">Back to Profile</Link>
          <Link to="/search" className="text-scholarly-primary hover:underline">Browse Articles</Link>
        </div>
      </div>
    </div>
  );
};

export default SavedPage;
