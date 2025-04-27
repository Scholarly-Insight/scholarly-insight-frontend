import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { UserFavorite, UserReadingHistory, UserAlert } from '../types/arXiv';

// Your Firebase configuration
// Replace this with your own Firebase config
const firebaseConfig = {

  apiKey: "AIzaSyD319eb4sz5ylo8oAjnx-d5iGpQxI5qUJ0",

  authDomain: "scholarly-insight-2908.firebaseapp.com",

  projectId: "scholarly-insight-2908",

  storageBucket: "scholarly-insight-2908.firebasestorage.app",

  messagingSenderId: "866222025259",

  appId: "1:866222025259:web:855709c06548e9c936d86e",

  measurementId: "G-J5H0MX5E67"

};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Export Firebase instances so they can be reused
export { app, db, auth, googleProvider };

// User Authentication
export const registerUser = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });

    // Create user profile in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      displayName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Get the token
    const token = await userCredential.user.getIdToken();

    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName,
      token
    };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Get the token
    const token = await userCredential.user.getIdToken();
    
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName,
      token
    };
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    // Check if user exists in Firestore, if not create a profile
    const userRef = doc(db, 'users', result.user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: result.user.email,
        displayName: result.user.displayName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    // Get the token
    const token = await result.user.getIdToken();
    
    return {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      token
    };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    
    // Clear user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    
    // Don't remove settings to persist them between sessions
    // localStorage.removeItem('userSettings');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// User Favorite Articles
export const addFavoriteArticle = async (userId: string, articleId: string, notes?: string) => {
  try {
    const favorite: UserFavorite = {
      articleId,
      savedAt: Date.now(),
      notes
    };

    await addDoc(collection(db, 'users', userId, 'favorites'), favorite);
  } catch (error) {
    console.error('Error adding favorite article:', error);
    throw error;
  }
};

export const removeFavoriteArticle = async (userId: string, favoriteId: string) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'favorites', favoriteId));
  } catch (error) {
    console.error('Error removing favorite article:', error);
    throw error;
  }
};

export const getFavoriteArticles = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'users', userId, 'favorites'),
      orderBy('savedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting favorite articles:', error);
    throw error;
  }
};

// Reading History
export const addReadingHistory = async (userId: string, articleId: string, completionPercentage?: number) => {
  try {
    const history: UserReadingHistory = {
      articleId,
      readAt: Date.now(),
      completionPercentage
    };

    // Check if article is already in reading history
    const q = query(
      collection(db, 'users', userId, 'readingHistory'),
      where('articleId', '==', articleId)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Add new reading history entry
      await addDoc(collection(db, 'users', userId, 'readingHistory'), history);
    } else {
      // Update existing reading history entry
      await updateDoc(querySnapshot.docs[0].ref, {
        readAt: Date.now(),
        completionPercentage
      });
    }
  } catch (error) {
    console.error('Error updating reading history:', error);
    throw error;
  }
};

export const getReadingHistory = async (userId: string, limitTo: number = 50) => {
  try {
    const q = query(
      collection(db, 'users', userId, 'readingHistory'),
      orderBy('readAt', 'desc'),
      limit(limitTo)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting reading history:', error);
    throw error;
  }
};

// User Alerts
export const createAlert = async (userId: string, categories: string[], keywords: string[]) => {
  try {
    const alert: Omit<UserAlert, 'id'> = {
      categories,
      keywords,
      createdAt: Date.now(),
      enabled: true
    };

    const docRef = await addDoc(collection(db, 'users', userId, 'alerts'), alert);

    // Update the alert with the generated ID
    await updateDoc(docRef, { id: docRef.id });

    return { id: docRef.id, ...alert };
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
};

export const updateAlert = async (userId: string, alertId: string, data: Partial<UserAlert>) => {
  try {
    await updateDoc(doc(db, 'users', userId, 'alerts', alertId), {
      ...data,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    throw error;
  }
};

export const deleteAlert = async (userId: string, alertId: string) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'alerts', alertId));
  } catch (error) {
    console.error('Error deleting alert:', error);
    throw error;
  }
};

export const getAlerts = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'users', userId, 'alerts'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data()
    })) as UserAlert[];
  } catch (error) {
    console.error('Error getting alerts:', error);
    throw error;
  }
};
