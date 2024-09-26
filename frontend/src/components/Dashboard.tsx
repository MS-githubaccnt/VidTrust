import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { serverUrl } from '../utils/api';

interface PostProps {
  title: string;
  body: string;
}

const Dashboard: React.FC = () => {
  const { loggedIn, checkLoginState, user } = useAuth();


  const handleLogout = async () => {
    try {
      await axios.post(`${serverUrl}/auth/logout`);
      checkLoginState();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <h3>Dashboard</h3>
      <button className="btn" onClick={handleLogout}>
        Logout
      </button>
      <h4>{user?.name}</h4>
      <p>{user?.email}</p>
      <img src={user?.picture} alt={user?.name} />
      <div>
      </div>
    </>
  );
};

export default Dashboard;