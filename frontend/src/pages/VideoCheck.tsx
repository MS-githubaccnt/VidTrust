import React, { useState } from "react";
import { createClient } from '@supabase/supabase-js';
import axios from "axios";
import { serverUrl } from '../utils/api';
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  LinearProgress, 
  Paper
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HomeIcon from '@mui/icons-material/Home';

const supabase = createClient("", "");

const VideoCheck: React.FC = () => {
  const [wasVidChecked,setWasVidChecked] = useState<Boolean>(false)
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isSubmitValid, setIsSubmitValid] = useState<boolean>(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  }

  const uploadFile = async () => {
    if (!selectedFile) return;

    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}+${selectedFile.name}`;

    try {
      const { data, error } = await supabase.storage
        .from('videos_to_check')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('videos_to_check')
        .getPublicUrl(filePath);

      setVideoUrl(publicUrl);
      setIsSubmitValid(true);
      setProgress(100);
    } catch (error) {
      console.error('Error uploading file:', error);
      setProgress(0);
    }
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const storeStruct = {
      name: title,
      videoUrl: videoUrl
    }
    const response = await axios.post(`${serverUrl}/test_video_url`, storeStruct)
    if (response.status === 200) {
      setProgress(0)
      setVideoUrl("")
      setTitle("")
      setSelectedFile(null)
      setIsSubmitValid(false)
    }
  }

  const handleBackToHome = async () => {
    if(wasVidChecked){
      const deleteThisVideo = {
        name: title
      }
      const response = await axios.post(`${serverUrl}/delete_video`, deleteThisVideo)
      if (response.status === 200) {
        navigate('/')
      }
    }
    else{
      navigate('/')
    }

  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '15px',
        boxShadow: '0 0 10px 5px rgba(0, 237, 100, 0.3)',
        backdropFilter: 'blur(5px)',
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      <Typography variant="h4" sx={{ color: 'white', mb: 4, fontFamily: 'Space Grotesk, sans-serif' }}>
        Video Check
      </Typography>
      
      <TextField
        fullWidth
        label="Video Title"
        variant="outlined"
        value={title}
        onChange={handleTitleChange}
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            color: 'white',
            '& fieldset': { borderColor: '#00ED64' },
            '&:hover fieldset': { borderColor: '#00ED64' },
            '&.Mui-focused fieldset': { borderColor: '#00ED64' },
          },
          '& .MuiInputLabel-root': { color: '#00ED64' },
        }}
      />
      
      <input
        accept="video/*"
        style={{ display: 'none' }}
        id="raised-button-file"
        type="file"
        onChange={handleFileInput}
      />
      <label htmlFor="raised-button-file">
        <Button
          variant="contained"
          component="span"
          startIcon={<CloudUploadIcon />}
          sx={{
            mb: 2,
            backgroundColor: '#00ED64',
            color: 'black',
            '&:hover': { backgroundColor: 'rgba(0, 237, 100, 0.8)' },
          }}
        >
          Select Video
        </Button>
      </label>
      
      {selectedFile && (
        <Typography variant="body2" sx={{ color: 'white', mb: 2 }}>
          Selected file: {selectedFile.name}
        </Typography>
      )}
      
      <Button
        onClick={uploadFile}
        variant="contained"
        disabled={!selectedFile}
        sx={{
          mb: 2,
          backgroundColor: '#00ED64',
          color: 'black',
          '&:hover': { backgroundColor: 'rgba(0, 237, 100, 0.8)' },
          '&.Mui-disabled': { backgroundColor: 'rgba(0, 237, 100, 0.3)', color: 'rgba(0, 0, 0, 0.3)' },
        }}
      >
        Upload to S3
      </Button>
      
      {progress > 0 && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress variant="determinate" value={progress} sx={{ backgroundColor: 'rgba(0, 237, 100, 0.3)', '& .MuiLinearProgress-bar': { backgroundColor: '#00ED64' } }} />
        </Box>
      )}
      
      <Button
        onClick={handleFinalSubmit}
        variant="contained"
        disabled={!isSubmitValid}
        startIcon={<CheckCircleOutlineIcon />}
        sx={{
          mb: 4,
          backgroundColor: '#00ED64',
          color: 'black',
          '&:hover': { backgroundColor: 'rgba(0, 237, 100, 0.8)' },
          '&.Mui-disabled': { backgroundColor: 'rgba(0, 237, 100, 0.3)', color: 'rgba(0, 0, 0, 0.3)' },
        }}
      >
        Check Video
      </Button>
      
      <Paper elevation={3} sx={{ p: 2, mb: 4, backgroundColor: 'rgba(0, 0, 0, 0.4)', color: 'white' }}>
        <Typography variant="h6" sx={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Report
        </Typography>
      </Paper>
      
      <Button
        onClick={handleBackToHome}
        variant="outlined"
        startIcon={<HomeIcon />}
        sx={{
          color: '#00ED64',
          borderColor: '#00ED64',
          '&:hover': { borderColor: '#00ED64', backgroundColor: 'rgba(0, 237, 100, 0.1)' },
        }}
      >
        Back to Home
      </Button>
    </Box>
  );
}

export default VideoCheck;