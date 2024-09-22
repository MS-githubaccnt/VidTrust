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
  const [posts, setPosts] = useState<PostProps[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (loggedIn === true) {
        try {
          const { data } = await axios.get(`${serverUrl}/user/posts`);
          setPosts(data.posts);
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchPosts();
  }, [loggedIn]);

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
        {posts.map((post, idx) => (
          <div key={idx}>
            <h5>{post.title}</h5>
            <p>{post.body}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default Dashboard;