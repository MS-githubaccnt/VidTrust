import React from 'react';
import { useAuth } from '../context/AuthContext';
import UploadVideoToS3WithNativeSdk from '@/components/VideoUpload';
import VideosFetch from '@/components/VideosFetch';
import StyledDrawer from '@/components/SideBar';
import { useSidebarContext } from '@/context/TabContext';

const Home: React.FC = () => {
  const { loggedIn } = useAuth();
  const { selectedItem } = useSidebarContext();

  if (loggedIn === true) return (
    <>
      <StyledDrawer />

      {selectedItem == 0 ? <UploadVideoToS3WithNativeSdk /> : <VideosFetch />}


    </>
  )

  return null;
};

export default Home;