import React from 'react';
import { useAuth } from '../context/AuthContext';
import Dashboard from '../components/Dashboard';
import UploadVideoToS3WithNativeSdk from '@/components/VideoUpload';

const Home: React.FC = () => {
  const { loggedIn } = useAuth();

  if (loggedIn === true) return (
    <>
      <Dashboard />;
      <UploadVideoToS3WithNativeSdk />
    </>
  )

  return null;
};

export default Home;