import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArticleById } from '../services/arXivService';
import { generateInsights } from '../services/aiService';
import { ArXivArticle, AIInsight } from '../types/arXiv';
import { format } from 'date-fns';
import { FaRegBookmark, FaBookmark, FaShare, FaDownload } from 'react-icons/fa';

const ArticlePage: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const [article, setArticle] = useState<ArXivArticle | null>(null);
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [insightsLoading, setInsightsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleId) return;

      try {
        setLoading(true);
        const articleData = await getArticleById(articleId);
        setArticle(articleData);
        setError(null);

        // After fetching article, get AI insights
        setInsightsLoading(true);
        const articleInsights = await generateInsights(articleData);
        setInsights(articleInsights);
      } catch (err) {
        setError('Failed to load article. Please try again later.');
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
        setInsightsLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-scholarly-primary border-t-transparent"></div>
        <p className="mt-4 text-scholarly-secondaryText">Loading article...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center">
          <p className="text-xl font-medium mb-2">Error</p>
          <p>{error || 'Article not found'}</p>
          <Link to="/" className="mt-4 inline-block text-scholarly-primary hover:underline">
            Return to home page
          </Link>
        </div>
      </div>
    );
  }

  const publishDate = new Date(article.published);
  const pdfLink = article.links.find(link => link.title === 'pdf' || link.type === 'application/pdf')?.href;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-scholarly-card p-6 mb-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-scholarly-text mb-4">{article.title}</h1>

              <div className="flex flex-wrap items-center text-scholarly-secondaryText text-sm mb-4">
                <span className="mr-3">{format(publishDate, 'MMMM d, yyyy')}</span>
                <span className="mr-3">•</span>
                <Link
                  to={`/search?category=${article.primary_category.term}`}
                  className="text-scholarly-primary hover:underline mr-3"
                >
                  {article.primary_category.term}
                </Link>
                {article.doi && (
                  <>
                    <span className="mr-3">•</span>
                    <span>DOI: {article.doi}</span>
                  </>
                )}
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-scholarly-secondaryText mb-1">Authors</h3>
                <p className="text-scholarly-text">
                  {article.authors.map((author, index) => (
                    <span key={author.name + index}>
                      <Link
                        to={`/search?author=${encodeURIComponent(author.name)}`}
                        className="hover:text-scholarly-primary"
                      >
                        {author.name}
                      </Link>
                      {index < article.authors.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </p>
              </div>

              {article.journal_ref && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-scholarly-secondaryText mb-1">Journal Reference</h3>
                  <p className="text-scholarly-text">{article.journal_ref}</p>
                </div>
              )}

              <div className="flex space-x-3 mb-4">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="flex items-center space-x-1 text-scholarly-secondaryText hover:text-scholarly-primary"
                >
                  {isFavorite ? <FaBookmark /> : <FaRegBookmark />}
                  <span>{isFavorite ? 'Saved' : 'Save'}</span>
                </button>

                <button className="flex items-center space-x-1 text-scholarly-secondaryText hover:text-scholarly-primary">
                  <FaShare />
                  <span>Share</span>
                </button>

                {pdfLink && (
                  <a
                    href={pdfLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-scholarly-secondaryText hover:text-scholarly-primary"
                  >
                    <FaDownload />
                    <span>Download PDF</span>
                  </a>
                )}
              </div>
            </div>

            <div className="border-t border-scholarly-borderColor pt-4">
              <h2 className="text-xl font-semibold mb-3">Abstract</h2>
              <p className="text-scholarly-text whitespace-pre-line">{article.summary}</p>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-lg shadow-scholarly-card p-6 mb-6">
            <h2 className="text-xl font-semibold mb-3">Categories</h2>
            <div className="flex flex-wrap gap-2">
              {article.categories.map(category => (
                <Link
                  key={category.term}
                  to={`/search?category=${category.term}`}
                  className="bg-scholarly-buttonBg hover:bg-scholarly-hoverBg text-scholarly-text px-3 py-1 rounded-full text-sm"
                >
                  {category.term}
                </Link>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="bg-white rounded-lg shadow-scholarly-card p-6">
            <h2 className="text-xl font-semibold mb-3">Links</h2>
            <div className="space-y-2">
              {article.links.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-scholarly-primary hover:underline"
                >
                  {link.title || link.rel || 'Link'} {link.type && `(${link.type})`}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar with AI insights */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-scholarly-card p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4 scholarly-logo-text">AI Insights</h2>

            {insightsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-scholarly-primary border-t-transparent"></div>
                <p className="mt-2 text-scholarly-secondaryText">Generating insights...</p>
              </div>
            ) : insights ? (
              <>
                <div className="mb-6">
                  <h3 className="text-md font-medium text-scholarly-secondaryText mb-2">Summary</h3>
                  <p className="text-scholarly-text">{insights.summary}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-md font-medium text-scholarly-secondaryText mb-2">Key Findings</h3>
                  <ul className="list-disc pl-5 text-scholarly-text space-y-2">
                    {insights.keyFindings.map((finding, index) => (
                      <li key={index}>{finding}</li>
                    ))}
                  </ul>
                </div>

                {insights.relatedArticles && insights.relatedArticles.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium text-scholarly-secondaryText mb-2">Related Articles</h3>
                    <div className="space-y-3">
                      {insights.relatedArticles.map(article => (
                        <div key={article.id} className="border-b border-scholarly-borderColor pb-3">
                          <Link
                            to={`/article/${article.id.split('/').pop()}`}
                            className="font-medium text-scholarly-primary hover:underline"
                          >
                            {article.title}
                          </Link>
                          <div className="text-sm text-scholarly-secondaryText mt-1">
                            {article.authors.slice(0, 2).map(author => author.name).join(', ')}
                            {article.authors.length > 2 && ', et al.'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-scholarly-secondaryText">
                No insights available for this article.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;
