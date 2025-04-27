import { useParams, Link } from 'react-router-dom';
import { getArticleById } from '../services/arXivService';
import { generateInsights } from '../services/aiService';
import { ArXivArticle, AIInsight } from '../types/arXiv';
import { DiscussionEntry } from '../types/discussion';
import { format } from 'date-fns';
import { FaRegBookmark, FaBookmark, FaShare, FaDownload, FaFilePdf, FaTimes, FaExpand, FaCompress, FaThumbsDown, FaRegThumbsDown, FaThumbsUp, FaRegThumbsUp } from 'react-icons/fa';
import {getDiscussionData, sendCommentData} from '../services/discussionService';
import { getAuth } from 'firebase/auth';

import DiscussionMessage from '../components/ui/DiscussionMessage';
import React, { useState, useEffect, useRef } from 'react';
import { generateAISummary, enhanceWithPDFInfo } from '../services/ai_summary/aiSummaryService';
import { saveUserInteraction, hasUserInteraction } from '../services/userPreferencesService';
import { addToReadingHistory, likeArticle, dislikeArticle, isArticleLiked, isArticleDisliked } from '../utils/articleInteractions';


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
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // New state for PDF viewer
  const [showPdfViewer, setShowPdfViewer] = useState<boolean>(false);
  const [fullscreenPdf, setFullscreenPdf] = useState<boolean>(false);
  const pdfViewerRef = useRef<HTMLDivElement>(null);

  const [isDisliked, setIsDisliked] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleId) return;
      try {
        setLoading(true);
        const articleData = await getArticleById(articleId);
        setArticle(articleData);
        setError(null);
        // Find and set PDF URL with enhanced detection
        const foundPdfUrl = findPdfUrl(articleData);
        setPdfUrl(foundPdfUrl);
        // Add to reading history
        if (articleData) {
          addToReadingHistory({
            id: articleId,
            title: articleData.title,
            authors: articleData.authors.map(author => author.name),
            abstract: articleData.summary,
            date: articleData.published || new Date().toISOString(),
            source: 'arxiv'
          });
        }
        const discussionData = await getDiscussionData(articleId || "No Article Provided");
        setDiscussion(discussionData);
      } catch (err) {
        setError('Failed to load article. Please try again later.');
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
        setCommentsLoading(false);
      }
    };
    fetchArticle();
  }, [articleId]);

  // Fetch AI summary in a separate effect, after article is loaded
  useEffect(() => {
    const fetchAISummary = async () => {
      if (!article) return;
      setInsightsLoading(true);
      try {
        const articleInsights = await generateAISummary(article);
        const enhancedInsights = enhanceWithPDFInfo(articleInsights, pdfUrl || undefined);
        setInsights(enhancedInsights);
      } catch (err) {
        setInsights(null);
      } finally {
        setInsightsLoading(false);
      }
    };
    fetchAISummary();
    // Only run when article or pdfUrl changes
  }, [article, pdfUrl]);

  // Use useEffect to load saved preferences
  useEffect(() => {
    if (articleId) {
      // Check if article was previously liked or disliked using new utilities
      setIsDisliked(isArticleDisliked(articleId));
      setIsLiked(isArticleLiked(articleId));
      
      // Check if article was previously saved
      const wasSaved = hasUserInteraction(articleId, 'save');
      setIsFavorite(wasSaved);
      
      // Record view interaction
      saveUserInteraction({
        articleId,
        timestamp: Date.now(),
        interactionType: 'view',
      });
    }
  }, [articleId]);

  // Helper function to find PDF URL with better detection
  const findPdfUrl = (article: ArXivArticle): string | null => {
    if (!article || !article.links || article.links.length === 0) return null;
    
    // First, try to find a direct PDF link
    let pdfLink = article.links.find(link => 
      link.title?.toLowerCase() === 'pdf' || 
      link.type === 'application/pdf' || 
      (link.href && link.href.toLowerCase().includes('.pdf'))
    );
    
    // If not found, try to find an arXiv link that can be converted to PDF
    if (!pdfLink) {
      const arxivLink = article.links.find(link => 
        link.href && (
          link.href.includes('arxiv.org/abs/') || 
          link.href.includes('arxiv.org/pdf/')
        )
      );
      
      if (arxivLink) {
        // Convert abstract URL to PDF URL if needed
        let href = arxivLink.href;
        if (href.includes('/abs/')) {
          href = href.replace('/abs/', '/pdf/') + '.pdf';
        } else if (!href.endsWith('.pdf')) {
          href = href + '.pdf';
        }
        
        return href;
      }
    }
    
    return pdfLink ? pdfLink.href : null;
  };

  // Handler for PDF click
  const handleViewPdf = () => {
    setShowPdfViewer(true);
  };

  // Handler for closing PDF viewer
  const handleClosePdf = () => {
    setShowPdfViewer(false);
    setFullscreenPdf(false);
  };

  // Toggle fullscreen mode for PDF
  const toggleFullscreen = () => {
    setFullscreenPdf(!fullscreenPdf);
  };

  // Update like handler to use the new utility
  const handleLike = () => {
    // Toggle liked state
    const newLikedState = !isLiked;
    
    // If liked, remove dislike
    if (newLikedState && isDisliked) {
      setIsDisliked(false);
    }
    
    setIsLiked(newLikedState);
    
    if (articleId && article) {
      if (newLikedState) {
        // Use the new utility to add to liked articles
        likeArticle({
          id: articleId,
          title: article.title,
          authors: article.authors.map(author => author.name),
          abstract: article.summary,
          date: article.published || new Date().toISOString(),
          source: 'arxiv'
        });
      }
      
      // Still record in user preferences service for analytics
      saveUserInteraction({
        articleId,
        timestamp: Date.now(),
        interactionType: 'like',
        metadata: {
          category: article?.primary_category?.term,
          authors: article?.authors.map(author => author.name),
          title: article?.title
        }
      });
    }
  };

  // Update dislike handler to use the new utility
  const handleDislike = () => {
    const newDislikedState = !isDisliked;
    
    // If disliked, remove like
    if (newDislikedState && isLiked) {
      setIsLiked(false);
    }
    
    setIsDisliked(newDislikedState);
    
    if (articleId && article) {
      if (newDislikedState) {
        // Use the new utility to add to disliked articles
        dislikeArticle({
          id: articleId,
          title: article.title,
          authors: article.authors.map(author => author.name),
          abstract: article.summary,
          date: article.published || new Date().toISOString(),
          source: 'arxiv'
        });
      }
      
      // Still record in user preferences service for analytics
      saveUserInteraction({
        articleId,
        timestamp: Date.now(),
        interactionType: 'dislike',
        metadata: {
          category: article?.primary_category?.term,
          authors: article?.authors.map(author => author.name),
          title: article?.title
        }
      });
    }
  };

  // Update favorite handler
  const handleFavoriteToggle = () => {
    if (!article) return;
    const saved = localStorage.getItem('savedArticles');
    let savedArticles = saved ? JSON.parse(saved) : [];
    const exists = savedArticles.some((a: any) => a.id === article.id);
    let newFavoriteState;
    if (exists) {
      // Remove from saved
      savedArticles = savedArticles.filter((a: any) => a.id !== article.id);
      newFavoriteState = false;
    } else {
      // Add to saved
      savedArticles.push({
        id: article.id,
        title: article.title,
        authors: article.authors.map(author => author.name),
        abstract: article.summary,
        date: article.published || new Date().toISOString(),
        source: 'arxiv',
      });
      newFavoriteState = true;
    }
    localStorage.setItem('savedArticles', JSON.stringify(savedArticles));
    setIsFavorite(newFavoriteState);
    // Save the interaction for analytics
    if (articleId) {
      saveUserInteraction({
        articleId,
        timestamp: Date.now(),
        interactionType: 'save',
        metadata: {
          category: article?.primary_category?.term,
          authors: article?.authors.map(author => author.name),
          title: article?.title
        }
      });
    }
  };

  useEffect(() => {
    if (!articleId) return;
    // Function to check if the article is saved
    const checkIsFavorite = () => {
      const saved = localStorage.getItem('savedArticles');
      const savedArticles = saved ? JSON.parse(saved) : [];
      setIsFavorite(savedArticles.some((a: any) => a.id === articleId));
    };
    checkIsFavorite();
    // Listen for storage changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'savedArticles') {
        checkIsFavorite();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
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

          
        setDiscussion(discussion => {
          const dataToSort = [...discussion];
          dataToSort.sort((a, b) => Number(b.timestamp) - Number(a.timestamp)); // or b.money - a.money to invert order
          return dataToSort; // <-- now sorted ascending
        })
        
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
                  onClick={handleFavoriteToggle}
                  className="flex items-center space-x-1 text-scholarly-secondaryText hover:text-scholarly-primary"
                >
                  {isFavorite ? <FaBookmark /> : <FaRegBookmark />}
                  <span>{isFavorite ? 'Saved' : 'Save'}</span>
                </button>

                <button className="flex items-center space-x-1 text-scholarly-secondaryText hover:text-scholarly-primary">
                  <FaShare />
                  <span>Share</span>
                </button>

                {/* Like Button */}
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-1 ${isLiked ? 'text-green-600' : 'text-scholarly-secondaryText hover:text-green-600'}`}
                  aria-label="Like"
                >
                  {isLiked ? <FaThumbsUp /> : <FaRegThumbsUp />}
                  <span>Like</span>
                </button>

                {/* Dislike Button */}
                <button
                  onClick={handleDislike}
                  className={`flex items-center space-x-1 ${isDisliked ? 'text-red-600' : 'text-scholarly-secondaryText hover:text-red-600'}`}
                  aria-label="Dislike"
                >
                  {isDisliked ? <FaThumbsDown /> : <FaRegThumbsDown />}
                  <span>Dislike</span>
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
            <h2 className="text-xl font-semibold mb-4 scholarly-logo-text">AI Summary</h2>

            {insightsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-scholarly-primary border-t-transparent"></div>
                <p className="mt-2 text-scholarly-secondaryText">Generating summary...</p>
              </div>
            ) : insights ? (
              <>
                <div className="mb-6">
                  <h3 className="text-md font-medium text-scholarly-secondaryText mb-2">Summary</h3>
                  <p className="text-scholarly-text whitespace-pre-line leading-relaxed">{insights.summary}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-md font-medium text-scholarly-secondaryText mb-2">Key Findings</h3>
                  <ul className="list-disc pl-5 text-scholarly-text space-y-2">
                    {insights.keyFindings.map((finding, index) => (
                      <li key={index} className="leading-relaxed">{finding}</li>
                    ))}
                  </ul>
                </div>
                
                {pdfUrl && (
                  <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 className="text-md font-medium text-scholarly-secondaryText mb-2">Full Paper Access</h3>
                    <div className="space-y-2">
                      <a 
                        href={pdfUrl} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-scholarly-primary hover:underline"
                      >
                        <FaDownload className="mr-2" />
                        <span>Download PDF</span>
                      </a>
                      <button
                        onClick={handleViewPdf}
                        className="flex items-center text-scholarly-primary hover:underline w-full"
                      >
                        <FaFilePdf className="text-red-500 mr-2" />
                        <span>View PDF</span>
                      </button>
                    </div>
                  </div>
                )}

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

      {/* PDF Viewer Overlay */}
      {showPdfViewer && pdfUrl && (
        <div 
          className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 ${
            fullscreenPdf ? 'p-0' : 'p-8'
          }`}
          onClick={handleClosePdf}
        >
          <div 
            ref={pdfViewerRef}
            className={`bg-white rounded-lg overflow-hidden relative ${
              fullscreenPdf ? 'w-full h-full rounded-none' : 'w-11/12 h-5/6 max-w-6xl'
            }`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-3 bg-gray-100 border-b border-gray-200">
              <h3 className="font-medium text-lg truncate">{article.title}</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={toggleFullscreen}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full"
                >
                  {fullscreenPdf ? <FaCompress /> : <FaExpand />}
                </button>
                <button 
                  onClick={handleClosePdf}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            <iframe
              src={pdfUrl}
              className="w-full h-full"
              style={{ height: fullscreenPdf ? 'calc(100% - 54px)' : 'calc(100% - 54px)' }}
              title="PDF Viewer"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticlePage;
