import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AuthContextProvider } from './context/AuthContext';
import Home from './pages/Home';
import Callback from './pages/Callback';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/auth/callback',
    element: <Callback />,
  },
]);

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <AuthContextProvider>
          <RouterProvider router={router} />
        </AuthContextProvider>
      </header>
    </div>
  );
};

export default App;