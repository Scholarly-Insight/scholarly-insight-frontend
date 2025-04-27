import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getRecentArticles, searchArticles } from '../services/arXivService';
import { ArXivArticle } from '../types/arXiv';
import { format } from 'date-fns';

const Home: React.FC = () => {
  const [recentArticles, setRecentArticles] = useState<ArXivArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentArticles = async () => {
      try {
        setLoading(true);
        const response = await getRecentArticles([], 10);
        setRecentArticles(response.feed.entry);
        setError(null);
      } catch (err) {
        setError('Failed to fetch recent articles. Please try again later.');
        console.error('Error fetching recent articles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentArticles();
  }, []);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const renderArticleCard = (article: ArXivArticle) => {
    const publishDate = new Date(article.published);

    return (
      <div key={article.id} className="article-card mb-4">
        <h3 className="text-xl font-medium text-scholarly-text mb-2">
          <Link to={`/article/${article.id.split('/').pop()}`} className="hover:text-scholarly-primary">
            {article.title}
          </Link>
        </h3>
        <div className="flex items-center text-scholarly-secondaryText text-sm mb-2">
          <span className="mr-2">{format(publishDate, 'MMM d, yyyy')}</span>
          <span className="mr-2">•</span>
          <span>{article.primary_category.term}</span>
        </div>
        <p className="text-scholarly-secondaryText text-sm mb-2">
          {article.authors.slice(0, 3).map(author => author.name).join(', ')}
          {article.authors.length > 3 && ', et al.'}
        </p>
        <p className="text-scholarly-text line-clamp-3">
          {article.summary.substring(0, 250)}...
        </p>
        <div className="mt-2">
          <Link
            to={`/article/${article.id.split('/').pop()}`}
            className="text-scholarly-primary text-sm hover:underline"
          >
            Read more
          </Link>
        </div>
      </div>
    );
  };

  const featuredCategories = [
    { id: 'cs.AI', name: 'Artificial Intelligence' },
    { id: 'cs.CL', name: 'Computation and Language' },
    { id: 'cs.CV', name: 'Computer Vision' },
    { id: 'cs.LG', name: 'Machine Learning' },
    { id: 'physics.med-ph', name: 'Medical Physics' },
    { id: 'q-bio', name: 'Quantitative Biology' }
  ];


  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <section className="mb-12">
        <div className="bg-white rounded-xl shadow-scholarly-card p-8 mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="scholarly-logo-text">Scholarly</span> Insight
          </h1>
          <p className="text-xl text-scholarly-secondaryText mb-6">
            Discover the latest research with AI-powered insights across all scientific domains
          </p>
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for articles, authors, or keywords..."
                className="w-full py-3 px-4 pr-10 border border-scholarly-borderColor rounded-lg focus:outline-none focus:ring-2 focus:ring-scholarly-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-scholarly-primary text-white rounded-lg px-4 py-2"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Popular Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {featuredCategories.map(category => (
            <Link
              key={category.id}
              to={`/search?category=${category.id}`}
              className="bg-white rounded-lg border border-scholarly-borderColor p-4 text-center hover:shadow-scholarly-card transition-shadow"
            >
              <span className="font-medium text-scholarly-text">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Recent Publications</h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-scholarly-primary border-t-transparent"></div>
            <p className="mt-2 text-scholarly-secondaryText">Loading recent publications...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {recentArticles.map(article => renderArticleCard(article))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
