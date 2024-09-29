import React from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { serverUrl } from '../utils/api';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';

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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '15px',
        boxShadow: '0 0 10px 5px rgba(0, 237, 100, 0.3)',
        backdropFilter: 'blur(5px)',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: 'white',
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 700,
          marginBottom: '20px',

        }}
      >
        Dashboard
      </Typography>
      
      <Avatar
        src={user?.picture}
        alt={user?.name}
        sx={{
          width: 100,
          height: 100,
          marginBottom: '15px',
          border: '3px solid #00ED64',
          boxShadow: '0 0 10px rgba(0, 237, 100, 0.5)',
        }}
      />
      
      <Typography
        variant="h5"
        sx={{
          color: '#00ED64',
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 600,
          marginBottom: '5px',
        }}
      >
        {user?.name.split(" ")[0]}
      </Typography>
      
      <Typography
        variant="body1"
        sx={{
          color: 'white',
          fontFamily: 'Space Grotesk, sans-serif',
          marginBottom: '20px',
        }}
      >
        {user?.email.split('@')[0]}
      </Typography>
      
      <Button
        variant="contained"
        onClick={handleLogout}
        sx={{
          backgroundColor: '#00ED64',
          color: 'black',
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 600,
          '&:hover': {
            backgroundColor: 'rgba(0, 237, 100, 0.8)',
          },
        }}
      >
        Logout
      </Button>
    </Box>
  );
};

export default Dashboard;