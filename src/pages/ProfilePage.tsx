import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Paper, Tabs, Tab, List, ListItem, ListItemText, Divider, Button, Chip, Avatar, Snackbar, Alert } from '@mui/material';
import { FaHistory, FaThumbsUp, FaThumbsDown, FaExternalLinkAlt } from 'react-icons/fa';

interface Article {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  date: string;
  source: 'arxiv' | 'google_scholar';
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [historyItems, setHistoryItems] = useState<Article[]>([]);
  const [likedArticles, setLikedArticles] = useState<Article[]>([]);
  const [dislikedArticles, setDislikedArticles] = useState<Article[]>([]);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }
    
    // Load reading history
    const savedHistory = localStorage.getItem('readingHistory');
    if (savedHistory) {
      setHistoryItems(JSON.parse(savedHistory));
    } else {
      // Sample data
      setHistoryItems([
        {
          id: '2304.12345',
          title: 'Advances in Natural Language Processing',
          authors: ['Jane Smith', 'John Doe'],
          abstract: 'This paper presents recent advances in NLP...',
          date: '2023-04-15',
          source: 'arxiv'
        },
        {
          id: '10.1145/3442188.3445922',
          title: 'Deep Learning for Recommendation Systems',
          authors: ['Alice Johnson', 'Bob Brown'],
          abstract: 'We propose a novel deep learning approach...',
          date: '2023-03-22',
          source: 'google_scholar'
        }
      ]);
    }

    // Load liked articles
    const savedLiked = localStorage.getItem('likedArticles');
    if (savedLiked) {
      setLikedArticles(JSON.parse(savedLiked));
    } else {
      // Sample data
      setLikedArticles([
        {
          id: '2303.54321',
          title: 'Transformer Models for Scientific Text Classification',
          authors: ['Mark Wilson', 'Sarah Chen'],
          abstract: 'This paper explores the use of transformer models...',
          date: '2023-03-10',
          source: 'arxiv'
        }
      ]);
    }

    // Load disliked articles
    const savedDisliked = localStorage.getItem('dislikedArticles');
    if (savedDisliked) {
      setDislikedArticles(JSON.parse(savedDisliked));
    } else {
      // Sample data for disliked articles
      setDislikedArticles([
        {
          id: '10.1109/ACCESS.2023.123456',
          title: 'Survey of Traditional Machine Learning Methods',
          authors: ['David Garcia', 'Emma Lee'],
          abstract: 'This survey covers traditional ML methods...',
          date: '2023-02-05',
          source: 'google_scholar'
        }
      ]);
    }
  }, [navigate]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle removing an article from a list
  const handleRemoveArticle = (articleId: string, listType: 'history' | 'liked' | 'disliked') => {
    try {
      if (listType === 'history') {
        const updatedHistory = historyItems.filter(item => item.id !== articleId);
        setHistoryItems(updatedHistory);
        localStorage.setItem('readingHistory', JSON.stringify(updatedHistory));
      } else if (listType === 'liked') {
        const updatedLiked = likedArticles.filter(item => item.id !== articleId);
        setLikedArticles(updatedLiked);
        localStorage.setItem('likedArticles', JSON.stringify(updatedLiked));
      } else if (listType === 'disliked') {
        const updatedDisliked = dislikedArticles.filter(item => item.id !== articleId);
        setDislikedArticles(updatedDisliked);
        localStorage.setItem('dislikedArticles', JSON.stringify(updatedDisliked));
      }
      
      setNotification({
        open: true,
        message: 'Article removed successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error removing article:', error);
      setNotification({
        open: true,
        message: 'Failed to remove article',
        type: 'error'
      });
    }
  };

  // Handle moving an article between lists
  const handleMoveArticle = (article: Article, fromList: 'disliked', toList: 'liked') => {
    try {
      // Remove from original list
      if (fromList === 'disliked') {
        const updatedDisliked = dislikedArticles.filter(item => item.id !== article.id);
        setDislikedArticles(updatedDisliked);
        localStorage.setItem('dislikedArticles', JSON.stringify(updatedDisliked));
        
        // Add to target list if not already there
        if (!likedArticles.some(item => item.id === article.id)) {
          const updatedLiked = [...likedArticles, article];
          setLikedArticles(updatedLiked);
          localStorage.setItem('likedArticles', JSON.stringify(updatedLiked));
        }
      }
      
      setNotification({
        open: true,
        message: `Article moved to ${toList} list`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error moving article:', error);
      setNotification({
        open: true,
        message: 'Failed to move article',
        type: 'error'
      });
    }
  };

  // Handle closing notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const renderArticleList = (articles: Article[], showActionButton = false, actionType?: 'remove' | 'move') => {
    if (articles.length === 0) {
      return (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No articles found.
          </Typography>
        </Box>
      );
    }

    return (
      <List>
        {articles.map((article, index) => (
          <React.Fragment key={article.id}>
            <ListItem alignItems="flex-start" sx={{ py: 2 }}>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {article.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {article.authors.join(', ')} • {article.date}
                    </Typography>
                    <Chip 
                      size="small" 
                      label={article.source === 'arxiv' ? 'arXiv' : 'Google Scholar'} 
                      sx={{ mr: 1, mb: 1 }} 
                    />
                  </Box>
                  <Box>
                    {showActionButton && (
                      <Button 
                        size="small" 
                        color={actionType === 'remove' ? 'error' : 'primary'}
                        variant="outlined"
                        sx={{ ml: 2 }}
                        onClick={() => {
                          if (actionType === 'remove') {
                            // Get current tab to determine which list to remove from
                            const listType = tabValue === 0 ? 'history' : tabValue === 1 ? 'liked' : 'disliked';
                            handleRemoveArticle(article.id, listType as 'history' | 'liked' | 'disliked');
                          } else if (actionType === 'move') {
                            handleMoveArticle(article, 'disliked', 'liked');
                          }
                        }}
                      >
                        {actionType === 'remove' ? 'Remove' : 'Move to Liked'}
                      </Button>
                    )}
                    <Button 
                      size="small" 
                      startIcon={<FaExternalLinkAlt />}
                      component={Link}
                      to={`/article/${article.id}`}
                      sx={{ ml: 1 }}
                    >
                      View
                    </Button>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {article.abstract.length > 200 
                    ? `${article.abstract.substring(0, 200)}...` 
                    : article.abstract}
                </Typography>
              </Box>
            </ListItem>
            {index < articles.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Your Profile
      </Typography>

      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<FaHistory />} label="Reading History" />
          <Tab icon={<FaThumbsUp />} label="Liked Articles" />
          <Tab icon={<FaThumbsDown />} label="Disliked Articles" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {tabValue === 0 && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>Reading History</Typography>
              {renderArticleList(historyItems, true, 'remove')}
            </>
          )}
          {tabValue === 1 && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>Liked Articles</Typography>
              {renderArticleList(likedArticles, true, 'remove')}
            </>
          )}
          {tabValue === 2 && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>Disliked Articles</Typography>
              {renderArticleList(dislikedArticles, true, 'remove')}
            </>
          )}
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button 
          component={Link} 
          to="/settings" 
          variant="contained" 
          color="primary"
        >
          Manage Settings
        </Button>
      </Box>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={3000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.type} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage;
