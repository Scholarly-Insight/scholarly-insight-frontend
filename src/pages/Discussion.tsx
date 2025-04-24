import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArXivArticle, SearchParams } from '../types/arXiv';
import { DocumentData } from 'firebase/firestore';
import { format } from 'date-fns';

import { DiscussionEntry } from '../types/discussion';
import { searchArticles, getArticleById } from '../services/arXivService';
import DiscussionMessage from '../components/ui/DiscussionMessage';

import {getDiscussionData, sendCommentData} from '../services/discussionService';

const Discussion: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [discussion, setDiscussion] = useState<{ id: string; replies: DocumentData[]; }[]>([]);
  const [articleData, setArticleData] = useState<ArXivArticle[]>([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getRecentComments = async () => {

      if (discussion.length > 0) return;

      setLoading(true);

      const params: SearchParams = {
        searchQuery: "",
        sortBy: 'relevance',
        sortOrder: 'descending',
        startIndex: 0,
        maxResults: 10,
      };
      
      const response = await searchArticles(params);
  
      console.log("DISCUSSION BEEN", response);
  
      const discussionData = await getDiscussionData(response.feed.entry[0].id.split('/').pop() || '');
  
      console.log("DISCUSSION RESPONSE", discussionData);

      setDiscussion(discussionData);

      setLoading(false);

      for (let i = 0; i < discussionData.length; i++) {

        const articleData1 = await getArticleById(discussionData[i].articleId);
        // console.log("ARTICLE DATA", articleData);

        setArticleData( // Replace the state
          [ // with a new array
            ...articleData, // that contains all the old items
            articleData1 // and one new item at the end
          ]
        );
      }


  
      return discussionData;
    };

    getRecentComments();
  });

  console.log("HEEEE");

  return (



    <div className="max-w-6xl mx-auto px-4 py-6">

    {loading ? (<div className="max-w-4xl mx-auto px-4 py-12 text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-scholarly-primary border-t-transparent"></div>
      <p className="mt-4 text-scholarly-secondaryText">Loading Discussions...</p>
    </div>) : null}

      <section className="mb-12">

      <section className="mb-12">
        <div className="bg-white rounded-xl shadow-scholarly-card p-8 mb-8">
          <h1 className="text-4xl font-bold mb-4">
          <h2 className="text-2xl font-bold mb-4">Trending Discussion Posts</h2>
          </h1>
          <div className="relative">
            <button className="absolute right-3 -top-8 -translate-y-1/2 bg-scholarly-primary text-white rounded-lg px-4 py-2">
              Start a Discussion
            </button>
          </div>
        </div>
      </section>

      {
      discussion.map((entry, i) => (
        <div key={entry.id} className="article-card mb-4">
        <h3 className="text-lg font-medium text-scholarly-text mb-2">
          <Link to={`/article/${entry.articleId}#discussion`} className="hover:text-scholarly-primary">
            {articleData[i]?.title || ""}
          </Link>
        </h3>
        <p className="text-scholarly-text text-sm mb-2">
          {entry.username + " on " + format(new Date(entry.timestamp), 'MMMM dd, yyyy')}
        </p>
        <p className="text-scholarly-secondaryText line-clamp-2 ml-4">
          {entry.message}
        </p>
        <div className="mt-2 flex space-x-4">
          <Link
            to={`/article/${entry.articleId}#discussion`}
            className="text-scholarly-primary text-sm hover:underline"
          >
            View Comment
          </Link>
  
        </div>
      </div>
    ))}

      </section>
    </div>
  );
};

export default Discussion;
