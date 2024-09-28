import React from 'react';
import axios from 'axios';
import { serverUrl } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import Divider from '@mui/material/Divider';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';

import "./LoginPage.css"

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const handleLogin = async () => {
    try {
      const { data: { url } } = await axios.get(`${serverUrl}/auth/url`);
      window.location.assign(url);
    } catch (err) {
      console.error(err);
    }
  };

  const to_video_check = () =>{
    navigate("/video_check");
  }
  
  return (
    <div className='main_div'>
      <div className='left'>
        <div className='heading'>
          TrustVid
        </div>
        <div className='motto'>
          Your <span>Content</span> now <span>Authenticated</span>
        </div>
      </div>

      <div className='right'>
        <Card 
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            boxShadow: '0 0 10px 5px rgba(0, 237, 100, 0.3)',
            backdropFilter: 'blur(5px)',
            padding: "5%",
            width: "600px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CardContent 
            className='card' 
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
            }}
          >
            <h2 
              className='form_heading' 
              style={{ 

                marginTop:"0px",
                color: 'white',
                textAlign: 'center',
                marginBottom: '20px',
                fontSize: "2.5rem",
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: "700",
              }}
            >
              Login as Content Creator
            </h2>
            <Button   
            
              variant='contained'
              onClick={handleLogin}
              style={{
                padding: "10px 0",
                width: "50%",
                fontFamily: "Roboto, sans-serif",
                fontWeight: "700",
                fontSize: "1rem",
                backgroundColor: '#00ED64',
                color: 'black',
                marginBottom: '15px',
              }}
            >
              Sign In with Google
            </Button>
          </CardContent>
          <hr style={{
            width:"70%",
            borderColor:"#00ED64"
          }} />
          <Button 
              onClickCapture={to_video_check}  
              variant='contained'
              onClick={handleLogin}
              style={{
                padding: "10px 0",
                width: "50%",
                fontFamily: "Roboto, sans-serif",
                fontWeight: "700",
                fontSize: "1rem",
                backgroundColor: '#00ED64',
                color: 'black',
                marginBottom: '0px',
                marginTop:"25px"
              }}
            >
              Authenticate a Video
            </Button>
          <p style={{
            color: "white",
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: "700",
            fontSize: "1rem",
            margin: "5px 0",
            textAlign: "center",
          }}>
            (No Login Required)
          </p>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;