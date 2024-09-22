import React from 'react';
import { useAuth } from '../context/AuthContext';
import Dashboard from '../components/Dashboard';
import Login from '../components/Login';

const Home: React.FC = () => {
  const { loggedIn } = useAuth();

  if (loggedIn === true) return <Dashboard />;
  if (loggedIn === false) return <Login />;
  return null;
};

export default Home;