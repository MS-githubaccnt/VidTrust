import React from 'react';
import { BrowserRouter, Navigate, Route, RouterProvider, Routes, createBrowserRouter } from 'react-router-dom';
import { AuthContextProvider, useAuth } from './context/AuthContext';
import Callback from './pages/Callback';
import LoginPage from './pages/LoginPage';
import Home from './pages/Home';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/auth/callback',
    element: <Callback />,
  },
]);

const App: React.FC = () => {
  const { loggedIn } = useAuth();
  return (
    <div className="App">
      <header className="App-header">
        <BrowserRouter>
            <Routes>
            <Route element={<LoginPage />} path='/' />
            <Route element={loggedIn ? <Home /> : <Navigate to="/"/>} path="/home" /> 
            <Route element={<Callback />} path='/auth/callback' />
            </Routes>
        </BrowserRouter>

      </header>
    </div>
  );
};

export default App;