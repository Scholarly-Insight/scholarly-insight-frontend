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

  const [value, setValue] = useState("");
  

  useEffect(() => {
    const getRecentComments = async () => {

      if (discussion.length > 0) return;

      setLoading(true);

      const params: SearchParams = {
        searchQuery: "",
        sortBy: 'relevance',
        sortOrder: 'descending',
        startIndex: 0,
        maxResults: 50,
      };
      
      const response = await searchArticles(params);

      
  
      const discussionData = await getDiscussionData("General Comment");

      for (let i = 0; i < discussionData.length; i++) {
        setDiscussion((discussion) => [...discussion, discussionData[i]]);


        const articleData1 = {title: "General Comment"};

        setArticleData((articleData) => [...articleData, articleData1]);
          
        setDiscussion(discussion => {
          const dataToSort = [...discussion];
          dataToSort.sort((a, b) => Number(b.timestamp) - Number(a.timestamp)); // or b.money - a.money to invert order
          return dataToSort; // <-- now sorted ascending
        })
      }


      for (let j = 0; j < response.feed.entry.length; j++) {

        const discussionData = await getDiscussionData(response.feed.entry[j].id.split('/').pop() || '');

        console.log("DISCUSSION SORTED", discussion);


        for (let i = 0; i < discussionData.length; i++) {
          setDiscussion((discussion) => [...discussion, discussionData[i]]);

          const articleData1 = await getArticleById(discussionData[i].articleId);
  
          setArticleData((articleData) => [...articleData, articleData1]);
  
          setDiscussion(discussion => {
            const dataToSort = [...discussion];
            dataToSort.sort((a, b) => Number(b.timestamp) - Number(a.timestamp)); // or b.money - a.money to invert order
            return dataToSort; // <-- now sorted ascending
          })

        }

      }


    //   this?.state.data.sort((a, b) => a.item.timeM > b.item.timeM).map(
    //     (item, i) => <div key={i}> {item.matchID} {item.timeM} {item.description}</div>
    // )
    //   setDiscussion(discussion.sort((a, b) => (a.timestamp > b.timestamp) ? 1 : -1));

      console.log("Discussion after sorting", discussion);


      setLoading(false);

  
      return;
    };

    getRecentComments();
  });

  async function addComment() {
        // TODO: Uncomment when integrating user authentication
    //       if (!currentUser) {
    //         alert("Please sign in to comment");
    //         return;
    //       }
    if (!value.trim()) return;
    try {
      const comment = {
        articleId: "General Comment",
        message: value,
        username: "Test User", // currentUser.displayName || "Anonymous User",
        timestamp: Date.now(),
      };

      await sendCommentData("General Comment", comment);

      const updatedDiscussion = await getDiscussionData("General Comment");

      console.log("Updated Discussion", updatedDiscussion);

      setDiscussion(updatedDiscussion);

      console.log("ALL DISCUSSIONNN", discussion);

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

  console.log("HEEEE");

  return (



    <div className="max-w-6xl mx-auto px-4 py-6">
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
        <div key={"discussion"+entry.id} className="article-card mb-4">
        <h3 className="text-lg font-medium text-scholarly-text mb-2">
          <Link to={`/article/${entry?.articleId || ""}#discussion`} className="hover:text-scholarly-primary">
          {"Comments on "} <span className="text-scholarly-secondaryText text-gray text-lg mb-2"> {articleData[i]?.title} </span>{" on " + format(new Date(entry.timestamp), 'MMMM dd, yyyy')}
          </Link>
        </h3>
        <p className="text-scholarly-text line-clamp-2 ml-4">
          {entry.username + ": " + entry.message}
        </p>

        {entry?.replies?.map((reply, i) => (
          <p className="text-scholarly-secondaryText line-clamp-2 ml-4">
            {reply.username + ": " + reply.message}
          </p>
        ))}

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

export default Discussion;
