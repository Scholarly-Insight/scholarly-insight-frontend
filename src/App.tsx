import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/routes';

function App() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-scholarly-primary border-t-transparent"></div>
      </div>
    }>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
