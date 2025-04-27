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

const ReadingHistoryPage: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<Article[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('readingHistory');
    setHistoryItems(saved ? JSON.parse(saved) : []);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Your Reading History</h1>
      <div className="bg-white rounded-lg shadow-scholarly-card p-6 mb-6">
        {historyItems.length === 0 ? (
          <p className="text-scholarly-secondaryText mb-4">No reading history yet. Start reading articles to see them here!</p>
        ) : (
          <ul className="divide-y divide-scholarly-borderColor">
            {historyItems.map(article => (
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

export default ReadingHistoryPage;
