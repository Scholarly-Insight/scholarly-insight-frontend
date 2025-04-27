import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Switch, FormControlLabel, TextField, Button, Alert, Paper, Divider, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { signOut } from '../services/firebase';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  // State for settings
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [openPDFInNewTab, setOpenPDFInNewTab] = useState(true);
  const [fullscreenPDFViewer, setFullscreenPDFViewer] = useState(false);
  const [defaultSearchEngine, setDefaultSearchEngine] = useState('both');
  const [arXivCategories, setArXivCategories] = useState(['cs.AI', 'cs.CL']);
  const [saveStatus, setSaveStatus] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setDarkMode(settings.darkMode || false);
      setEmailNotifications(settings.emailNotifications || true);
      setOpenPDFInNewTab(settings.openPDFInNewTab || true);
      setFullscreenPDFViewer(settings.fullscreenPDFViewer || false);
      setDefaultSearchEngine(settings.defaultSearchEngine || 'both');
      setArXivCategories(settings.arXivCategories || ['cs.AI', 'cs.CL']);
    }
  }, []);

  // Handle save settings
  const handleSaveSettings = () => {
    // Create settings object
    const settings = {
      darkMode,
      emailNotifications,
      openPDFInNewTab,
      fullscreenPDFViewer,
      defaultSearchEngine,
      arXivCategories
    };
    
    // Save to localStorage
    localStorage.setItem('userSettings', JSON.stringify(settings));
    
    // Log settings for debugging
    console.log('Saving settings:', settings);

    // Apply dark mode if needed
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');

    // Show success message
    setSaveStatus({
      show: true,
      type: 'success',
      message: 'Settings saved successfully!'
    });

    // Hide message after 3 seconds
    setTimeout(() => {
      setSaveStatus({ show: false, type: 'success', message: '' });
    }, 3000);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      // Show error message
      setSaveStatus({
        show: true,
        type: 'error',
        message: 'Failed to sign out. Please try again.'
      });
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      {saveStatus.show && (
        <Alert severity={saveStatus.type} sx={{ mb: 3 }}>
          {saveStatus.message}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          User Settings
        </Typography>
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Email"
            defaultValue={localStorage.getItem('userEmail') || "user@example.com"}
            fullWidth
            disabled
            variant="outlined"
            sx={{ mb: 2 }}
          />
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Appearance
        </Typography>
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
            }
            label="Dark Mode"
          />
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Search Settings
        </Typography>
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Default Search Engine</InputLabel>
            <Select
              value={defaultSearchEngine}
              label="Default Search Engine"
              onChange={(e) => setDefaultSearchEngine(e.target.value)}
            >
              <MenuItem value="both">Both arXiv and Google Scholar</MenuItem>
              <MenuItem value="arxiv">arXiv Only</MenuItem>
              <MenuItem value="google_scholar">Google Scholar Only</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          arXiv Settings
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Default arXiv categories to include in searches:
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={arXivCategories.includes('cs.AI')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setArXivCategories([...arXivCategories, 'cs.AI']);
                  } else {
                    setArXivCategories(arXivCategories.filter(cat => cat !== 'cs.AI'));
                  }
                }}
              />
            }
            label="Computer Science - Artificial Intelligence (cs.AI)"
          />
          <FormControlLabel
            control={
              <Switch
                checked={arXivCategories.includes('cs.CL')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setArXivCategories([...arXivCategories, 'cs.CL']);
                  } else {
                    setArXivCategories(arXivCategories.filter(cat => cat !== 'cs.CL'));
                  }
                }}
              />
            }
            label="Computer Science - Computation and Language (cs.CL)"
          />
          <FormControlLabel
            control={
              <Switch
                checked={arXivCategories.includes('cs.LG')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setArXivCategories([...arXivCategories, 'cs.LG']);
                  } else {
                    setArXivCategories(arXivCategories.filter(cat => cat !== 'cs.LG'));
                  }
                }}
              />
            }
            label="Computer Science - Machine Learning (cs.LG)"
          />
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Notifications
        </Typography>
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
              />
            }
            label="Email Notifications"
          />
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          PDF Viewer Settings
        </Typography>
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={openPDFInNewTab}
                onChange={(e) => setOpenPDFInNewTab(e.target.checked)}
              />
            }
            label="Open PDFs in New Tab"
          />
          <Box sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={fullscreenPDFViewer}
                  onChange={(e) => setFullscreenPDFViewer(e.target.checked)}
                />
              }
              label="Fullscreen PDF Viewer"
            />
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={handleLogout}
        >
          Logout
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveSettings}
        >
          Save Settings
        </Button>
      </Box>
    </Container>
  );
};

export default SettingsPage; 