import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore, collection, getDocs, addDoc,
  doc, setDoc
} from 'firebase/firestore'

import { ArXivArticle, SearchParams } from '../types/arXiv';
import { searchArticles } from '../services/arXivService';
import { DiscussionEntry, CommentReply } from '../types/discussion';

const firebaseConfig = {
    apiKey: "AIzaSyD319eb4sz5ylo8oAjnx-d5iGpQxI5qUJ0",
    authDomain: "scholarly-insight-2908.firebaseapp.com",
    projectId: "scholarly-insight-2908",
    storageBucket: "scholarly-insight-2908.appspot.com",
    messagingSenderId: "43532q46523465",
    appId: "1:43532q46523465:web:abc123def456"
}

// Check if a Firebase app instance already exists, if not initialize a new one
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);

export const getDiscussionData = async (articleId: string) => {
    try {
      const commentsCol = collection(db, 'articles', articleId, 'comments');
      const commentsSnapshot = await getDocs(commentsCol);
      const comments = await Promise.all(commentsSnapshot.docs.map(async doc => {
          const data = doc.data();
          const repliesCol = collection(db, 'articles', articleId, 'comments', doc.id, 'replies');
          const repliesSnapshot = await getDocs(repliesCol);
          const replies = repliesSnapshot.docs.map(replyDoc => replyDoc.data());
          return { ...data, id: doc.id, replies };
      }));
      return comments;
    } catch (error) {
        console.error("Firestore fetch failed:", error);
        return [];
    }
};


export const sendCommentData = async (articleId: string, comment: any) => {
  const articleRef = doc(db, 'articles', articleId);
  await setDoc(articleRef, { exists: true }, { merge: true });

  const commentsCol = collection(db, 'articles', articleId, 'comments');
  await addDoc(commentsCol, comment);
};



export const sendReplyData = async (articleId: string, commentId: string, reply: any) => {
  const repliesCol = collection(db, 'articles', articleId, 'comments', commentId, 'replies');
  await addDoc(repliesCol, reply);
};
