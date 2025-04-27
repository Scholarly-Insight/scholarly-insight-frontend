// Article interaction utilities
import { getCurrentUser } from '../services/firebase';

export interface Article {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  date: string;
  source: 'arxiv' | 'google_scholar';
}

// Add article to reading history
export const addToReadingHistory = (article: Article): boolean => {
  try {
    // Get existing history or initialize as empty array
    const savedHistory = localStorage.getItem('readingHistory');
    let historyItems: Article[] = savedHistory ? JSON.parse(savedHistory) : [];
    
    // Check if article is already in history
    const existingIndex = historyItems.findIndex(item => item.id === article.id);
    
    if (existingIndex !== -1) {
      // Move to top if already exists
      historyItems.splice(existingIndex, 1);
    }
    
    // Add to beginning of the array (most recent)
    historyItems.unshift(article);
    
    // Limit history to 50 items
    if (historyItems.length > 50) {
      historyItems = historyItems.slice(0, 50);
    }
    
    // Save to localStorage
    localStorage.setItem('readingHistory', JSON.stringify(historyItems));
    
    return true;
  } catch (error) {
    console.error('Error adding to reading history:', error);
    return false;
  }
};

// Like an article
export const likeArticle = (article: Article): boolean => {
  try {
    // Get existing liked articles
    const savedLiked = localStorage.getItem('likedArticles');
    const likedArticles: Article[] = savedLiked ? JSON.parse(savedLiked) : [];
    
    // Check if article is already liked
    const isAlreadyLiked = likedArticles.some(item => item.id === article.id);
    
    if (!isAlreadyLiked) {
      // Add to liked articles
      likedArticles.push(article);
      localStorage.setItem('likedArticles', JSON.stringify(likedArticles));
      
      // Remove from disliked if present
      removeFromDisliked(article.id);
    }
    
    return true;
  } catch (error) {
    console.error('Error liking article:', error);
    return false;
  }
};

// Dislike an article
export const dislikeArticle = (article: Article): boolean => {
  try {
    // Get existing disliked articles
    const savedDisliked = localStorage.getItem('dislikedArticles');
    const dislikedArticles: Article[] = savedDisliked ? JSON.parse(savedDisliked) : [];
    
    // Check if article is already disliked
    const isAlreadyDisliked = dislikedArticles.some(item => item.id === article.id);
    
    if (!isAlreadyDisliked) {
      // Add to disliked articles
      dislikedArticles.push(article);
      localStorage.setItem('dislikedArticles', JSON.stringify(dislikedArticles));
      
      // Remove from liked if present
      removeFromLiked(article.id);
    }
    
    return true;
  } catch (error) {
    console.error('Error disliking article:', error);
    return false;
  }
};

// Check if article is liked
export const isArticleLiked = (articleId: string): boolean => {
  try {
    const savedLiked = localStorage.getItem('likedArticles');
    if (!savedLiked) return false;
    
    const likedArticles: Article[] = JSON.parse(savedLiked);
    return likedArticles.some(item => item.id === articleId);
  } catch (error) {
    console.error('Error checking if article is liked:', error);
    return false;
  }
};

// Check if article is disliked
export const isArticleDisliked = (articleId: string): boolean => {
  try {
    const savedDisliked = localStorage.getItem('dislikedArticles');
    if (!savedDisliked) return false;
    
    const dislikedArticles: Article[] = JSON.parse(savedDisliked);
    return dislikedArticles.some(item => item.id === articleId);
  } catch (error) {
    console.error('Error checking if article is disliked:', error);
    return false;
  }
};

// Helper: Remove from liked articles
const removeFromLiked = (articleId: string): boolean => {
  try {
    const savedLiked = localStorage.getItem('likedArticles');
    if (!savedLiked) return true;
    
    const likedArticles: Article[] = JSON.parse(savedLiked);
    const filteredArticles = likedArticles.filter(item => item.id !== articleId);
    
    localStorage.setItem('likedArticles', JSON.stringify(filteredArticles));
    return true;
  } catch (error) {
    console.error('Error removing from liked articles:', error);
    return false;
  }
};

// Helper: Remove from disliked articles
const removeFromDisliked = (articleId: string): boolean => {
  try {
    const savedDisliked = localStorage.getItem('dislikedArticles');
    if (!savedDisliked) return true;
    
    const dislikedArticles: Article[] = JSON.parse(savedDisliked);
    const filteredArticles = dislikedArticles.filter(item => item.id !== articleId);
    
    localStorage.setItem('dislikedArticles', JSON.stringify(filteredArticles));
    return true;
  } catch (error) {
    console.error('Error removing from disliked articles:', error);
    return false;
  }
}; 