import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArticleById } from '../services/arXivService';
import { generateInsights } from '../services/aiService';
import { ArXivArticle, AIInsight } from '../types/arXiv';
import { DiscussionEntry } from '../types/discussion';
import { format } from 'date-fns';
import { FaRegBookmark, FaBookmark, FaShare, FaDownload } from 'react-icons/fa';
import {getDiscussionData, sendCommentData} from '../services/discussionService';
import { getAuth } from 'firebase/auth';

import DiscussionMessage from '../components/ui/DiscussionMessage';

const ArticlePage: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const [article, setArticle] = useState<ArXivArticle | null>(null);
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [insightsLoading, setInsightsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [value, setValue] = useState("");

  const [discussion, setDiscussion] = useState<DiscussionEntry[]>([]);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleId) return;

      try {
        setLoading(true);
        const articleData = await getArticleById(articleId);
        setArticle(articleData);
        setError(null);

        setCommentsLoading(true);

        const discussionData = await getDiscussionData(articleId || "No Article Provided");


        console.log("Discussion Data:", discussionData);
        
        setDiscussion(discussionData);

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
        setCommentsLoading(false);
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

  const auth = getAuth();
//   const currentUser = auth.currentUser; // TODO: Uncomment when integrating user authentication

  const publishDate = new Date(article.published);
  //const pdfLink = article.links.find(link => link.title === 'pdf' || link.type === 'application/pdf')?.href;

  async function addComment() {
    // TODO: Uncomment when integrating user authentication
//       if (!currentUser) {
//         alert("Please sign in to comment");
//         return;
//       }
      if (!value.trim()) return;
      try {
        const comment = {
          articleId: articleId || "No Article Provided",
          message: value,
          username: "Test User", // currentUser.displayName || "Anonymous User",
          timestamp: Date.now(),
        };

        await sendCommentData(articleId || "No Article Provided", comment);

        const updatedDiscussion = await getDiscussionData(articleId || "No Article Provided");
        setDiscussion(updatedDiscussion);
        setValue("");
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    }
  
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

                {article.pdf_link && (
                  <a
                    href={article.pdf_link}
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

          {/* Discussion */}
          <section id="discussion">
            <div className="bg-white rounded-lg shadow-scholarly-card p-6 mb-6">
              <h2 className="text-xl font-semibold mb-3">Discussion</h2>

              {commentsLoading ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-scholarly-primary border-t-transparent"></div>
                  <p className="mt-2 text-scholarly-secondaryText">Loading comments...</p>
                </div>
              ) : discussion.length === 0 ? (
                <p className="text-scholarly-secondaryText">No comments yet. Be the first to comment!</p>
              ) : (
                <div className="space-y-2">
                  {discussion.map((aComment, idx) => (
                    <DiscussionMessage
                      key={aComment.id || idx}
                      comment={aComment}
                    />
                  ))}
                </div>
              )}

              {/* Comment form */}
              <div className="mt-6 border-t border-scholarly-borderColor pt-4">
                <h3 className="text-md font-medium mb-2">Add a comment</h3>
                <div className="flex items-center">
                <textarea
                  id="sendReply"
                  rows={2}
                  className="mx-2 block w-3/4 rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  placeholder="Post a comment..."
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                  }}
                ></textarea>
                  <button
                    onClick={addComment}
                    className="inline-flex cursor-pointer justify-center rounded-full p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600"
                    disabled={!value.trim() || commentsLoading}
                  >
                    <svg
                      className="h-5 w-5 rotate-90 rtl:-rotate-90"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 18 20"
                    >
                      <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
                    </svg>
                    <span className="sr-only">Send message</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
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
