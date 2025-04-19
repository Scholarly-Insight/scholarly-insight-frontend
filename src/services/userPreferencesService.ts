/**
 * This service handles user preferences tracking for article interactions
 * which can be used for building a recommendation system.
 */

// Types for user interactions
export interface ArticleInteraction {
  articleId: string;
  timestamp: number;
  interactionType: 'like' | 'dislike' | 'save' | 'view';
  // Additional metadata could be added here
  metadata?: {
    category?: string;
    authors?: string[];
    title?: string;
  };
}

// For demo purposes, storing in localStorage - in a real app this would be sent to a backend
const STORAGE_KEY = 'scholarly_user_interactions';

// Function to save user interaction
export const saveUserInteraction = (interaction: ArticleInteraction): void => {
  try {
    // Get existing interactions
    const existingInteractions = getUserInteractions();
    
    // Add new interaction
    existingInteractions.push(interaction);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingInteractions));
    
    console.log(`Saved ${interaction.interactionType} for article ${interaction.articleId}`);
    
    // In a real implementation, this would likely send data to a backend API
    // sendInteractionToApi(interaction);
  } catch (error) {
    console.error('Error saving user interaction:', error);
  }
};

// Function to get all user interactions
export const getUserInteractions = (): ArticleInteraction[] => {
  try {
    const storedInteractions = localStorage.getItem(STORAGE_KEY);
    return storedInteractions ? JSON.parse(storedInteractions) : [];
  } catch (error) {
    console.error('Error retrieving user interactions:', error);
    return [];
  }
};

// Function to get interactions for a specific article
export const getArticleInteractions = (articleId: string): ArticleInteraction[] => {
  const allInteractions = getUserInteractions();
  return allInteractions.filter(interaction => interaction.articleId === articleId);
};

// Function to check if user has a specific interaction with an article
export const hasUserInteraction = (
  articleId: string, 
  interactionType: 'like' | 'dislike' | 'save' | 'view'
): boolean => {
  const articleInteractions = getArticleInteractions(articleId);
  return articleInteractions.some(interaction => interaction.interactionType === interactionType);
};

// Clear all interaction data (useful for logout/testing)
export const clearInteractionData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// For a real recommendation system, you might add functions like:
// - getRecommendedArticles(userId: string): Promise<Article[]>
// - getUserPreferences(userId: string): Promise<UserPreference[]>
// - updateUserPreferences(userId: string, preferences: UserPreference[]): Promise<void> 