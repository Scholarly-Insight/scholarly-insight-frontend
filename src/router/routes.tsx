import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Import layout and pages
const Layout = React.lazy(() => import('../components/layout/Layout'));
const Home = React.lazy(() => import('../pages/Home'));
const ArticlePage = React.lazy(() => import('../pages/ArticlePage'));
const SearchResults = React.lazy(() => import('../pages/SearchResults'));
const AuthPage = React.lazy(() => import('../pages/AuthPage'));
const ProfilePage = React.lazy(() => import('../pages/ProfilePage'));
const FavoritesPage = React.lazy(() => import('../pages/FavoritesPage'));
const ReadingHistoryPage = React.lazy(() => import('../pages/ReadingHistoryPage'));
const AlertsPage = React.lazy(() => import('../pages/AlertsPage'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage'));

// Auth-protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // This would check if user is authenticated in a real app
  const isAuthenticated = false; // Replace with actual auth check

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Define routes
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'article/:articleId',
        element: <ArticlePage />
      },
      {
        path: 'search',
        element: <SearchResults />
      },
      {
        path: 'auth',
        element: <AuthPage />
      },
      {
        path: 'profile',
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>
      },
      {
        path: 'favorites',
        element: <ProtectedRoute><FavoritesPage /></ProtectedRoute>
      },
      {
        path: 'history',
        element: <ProtectedRoute><ReadingHistoryPage /></ProtectedRoute>
      },
      {
        path: 'alerts',
        element: <ProtectedRoute><AlertsPage /></ProtectedRoute>
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ],
  },
]);
