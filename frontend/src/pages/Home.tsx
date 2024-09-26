import React from 'react';
import { useAuth } from '../context/AuthContext';
import Dashboard from '../components/Dashboard';
import UploadVideoToS3WithNativeSdk from '@/components/VideoUpload';
import VideosFetch from '@/components/VideosFetch';

const Home: React.FC = () => {
  const { loggedIn } = useAuth();

  if (loggedIn === true) return (
    <>
      <Dashboard />;
      <UploadVideoToS3WithNativeSdk />
      <VideosFetch />
    </>
  )

  return null;
};

export default Home;