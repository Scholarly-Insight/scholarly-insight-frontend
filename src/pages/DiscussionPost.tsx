import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArXivArticle, SearchParams } from '../types/arXiv';
import { DocumentData } from 'firebase/firestore';
import { format } from 'date-fns';

import { DiscussionEntry } from '../types/discussion';
import { searchArticles, getArticleById } from '../services/arXivService';
import DiscussionMessage from '../components/ui/DiscussionMessage';

import {getDiscussionData, sendCommentData} from '../services/discussionService';
import { getAuth } from 'firebase/auth';

const DiscussionPost: React.FC = () => {
  const articleId = "General Comment";
  const [article, setArticle] = useState<ArXivArticle | null>(null);
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
        // const articleData = await getArticleById(articleId);
        // setArticle(articleData);
        setError(null);

        setCommentsLoading(true);

        const discussionData = await getDiscussionData(articleId);


        console.log("Discussion Data:", discussionData);
        
        setDiscussion(discussionData);

          
        setDiscussion(discussion => {
          const dataToSort = [...discussion];
          dataToSort.sort((a, b) => Number(b.timestamp) - Number(a.timestamp)); // or b.money - a.money to invert order
          return dataToSort; // <-- now sorted ascending
        })


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

  // if (error || !article) {
  //   return (
  //     <div className="max-w-4xl mx-auto px-4 py-12">
  //       <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center">
  //         <p className="text-xl font-medium mb-2">Error</p>
  //         <p>{error || 'Article not found'}</p>
  //         <Link to="/" className="mt-4 inline-block text-scholarly-primary hover:underline">
  //           Return to home page
  //         </Link>
  //       </div>
  //     </div>
  //   );
  // }

  const auth = getAuth();
//   const currentUser = auth.currentUser; // TODO: Uncomment when integrating user authentication

  // const publishDate = new Date(article.published);
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
      <section className="mb-12">

      {/* Discussion */}
      <section id="discussion">
        <div className="bg-white rounded-lg shadow-scholarly-card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">General Discussion Posts</h2>

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
      
        </div>
      </section>


          {loading ? (<div className="max-w-4xl mx-auto px-4 py-12 text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-scholarly-primary border-t-transparent"></div>
      <p className="mt-4 text-scholarly-secondaryText">Loading Discussions...</p>
      </div>) : null}

      </section>

      <div className="mt-6 border-t border-scholarly-borderColor pt-4">
        <h3 className="text-md font-medium mb-2">Start a Discussion</h3>
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
  );
};

export default DiscussionPost;
