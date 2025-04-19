import { getFirestore } from 'firebase/firestore';
import {
    collection, getDocs
} from 'firebase/firestore';

import { app, db as sharedDb } from './firebase';

import { DiscussionEntry, CommentReply } from '../types/discussion';

const db = sharedDb;

const colRef = collection(db, "commentBase");

getDocs(colRef)
    .then((snapshot) => {
        console.log(snapshot.docs);
    })
    .catch(error => {
        console.error("Error fetching comments:", error);
    });


export const getDiscussionData = async (articleId: string): Promise<DiscussionEntry[]> => {
    try {
      // get the data

      // heres some placeholder data for now
      return [{
        id: articleId,
        articleId: "12342",
        message: "Long Message Commenting on an article that is very long and has a lot of content. This is a test to see if the message can be long enough to fit in the comment box and still be readable. Let's see how this goes.",
        username: "John Doe",
        timestamp: Date.now(),
        replies: [
          {
            id: "reply1",
            articleId: articleId,
            message: "This is a reply to the comment.",
            username: "Jane Doe",
            timestamp: Date.now(),
          },
          {
            id: "reply2",
            articleId: articleId,
            message: "This is another reply to the comment.",
            username: "Alice Smith",
            timestamp: Date.now(),
          },
        ],
      
      }];


    } catch (error) {
      console.error('Error fetching article discussion', error);
      throw new Error('Error fetching article discussion');
    }
};



export const sendReplyData = async (articleId: string, reply: CommentReply) => {
  try {
    // send over a reply to a message
  } catch (error) {
    console.error('Error fetching article discussion', error);
    throw new Error('Error fetching article discussion');
  }
};


export const sendCommentData = async (articleId: string, comment: DiscussionEntry) => {
  try {
    // send over a new comment
  } catch (error) {
    console.error('Error fetching article discussion', error);
    throw new Error('Error fetching article discussion');
  }
};
