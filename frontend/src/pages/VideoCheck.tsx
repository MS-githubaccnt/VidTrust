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
// import {Storage} from '@google-cloud/storage'
import { sign } from "crypto";
import {Report,VideoTamperingDetectionReport} from "../type.ts"
import { json } from "stream/consumers";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL,import.meta.env.VITE_SUPABASE_ANON_KEY);
// const storage = new Storage();

const VideoCheck: React.FC = () => {
  const [wasVidChecked,setWasVidChecked] = useState<Boolean>(false)
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>("");
  const [json_report, setReport] = useState<Report|null>(null);
  const [video_tampering_report,setVideoTamperingReport]=useState<VideoTamperingDetectionReport|null>(null)
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  // const [signedUrl, setSignedUrl] = useState<string>("");
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
    const filePath = `${fileName}`;

    try {
      const { data, error } = await supabase.storage
        .from('videos_to_check')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;
      
      // const gcsResponse = await storage.bucket("deenank_bucket").file(filePath).save(
      //   selectedFile.stream(),{
      //     metadata:{
      //       contentType:selectedFile.type,
      //     }
      //   })

      // if (!gcsResponse) {
      //   throw new Error("Error uploading to Google Cloud Storage");
      // }
      
      // const [signedUrl]=await storage.bucket("deenank_bucket").file(filePath).getSignedUrl({
      //   action: 'read',
      //   expires: Date.now()+15*60*1000,
      // })
      const { data: { publicUrl } } = supabase.storage
        .from('videos_to_check')
        .getPublicUrl(filePath);
        console.log(filePath,fileName,publicUrl)
      setVideoUrl(publicUrl);
      // setSignedUrl(signedUrl);
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
      videoUrl: videoUrl,
      // signedUrl: signedUrl
    }
    const response = await axios.post(`${serverUrl}/test_video_url`, storeStruct)
    if (response.status === 200) {
      // setProgress(0)
      // setVideoUrl("")
      // // setSignedUrl("")
      // setTitle("")
      // setSelectedFile(null)
      // setIsSubmitValid(false)
      console.log("API Response:", response.data);
      const json_report=response.data.message
      const video_tampering_report=JSON.parse(json_report['Tampering detection result'].replace(/```json|```/g, '').trim())
      console.log(json_report,video_tampering_report)
      setReport(json_report)
      setVideoTamperingReport(video_tampering_report)
      console.log(response.data)
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
        accept="video/mkv"
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
        <div style={{height:'200px',overflowY:'scroll'}}>
        <Typography variant="h6" sx={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Report
        </Typography>
        {(json_report!=null)&&(video_tampering_report!=null)&&(<div>
          <h1>Signature Verification Result :</h1><h2>{json_report['Signature verification result']}</h2>
          <h1>Audio Comparision Analysis Result:</h1><h2>{json_report['Audio analysis result']}</h2>
          <h1>Audio Similarity Percentage:</h1><h2>{json_report['Audio similarity percentage']}</h2>
        <h1>Video Tampering Detection Report</h1>
      <h3>Date: {video_tampering_report['Video Tampering Detection Report'].Date}</h3>

      <h2>1. Shot Change Analysis</h2>
      <p>Average Shot Duration: {video_tampering_report['Video Tampering Detection Report']["1. Shot Change Analysis"]["Average Shot Duration"]}</p>
      <p>Number of Rapid Shot Changes: {video_tampering_report['Video Tampering Detection Report']["1. Shot Change Analysis"]["Number of Rapid Shot Changes"]}</p>

      <h2>2. Object Tracking Analysis</h2>
      <p>Total Number of Objects Tracked: {video_tampering_report['Video Tampering Detection Report']["2. Object Tracking Analysis"]["Total Number of Objects Tracked"]}</p>
      <p>Number of Suspiciously Brief Object Appearances: {video_tampering_report['Video Tampering Detection Report']["2. Object Tracking Analysis"]["Number of Suspiciously Brief Object Appearances"]}</p>
      <h3>Suspicious Objects Detected:</h3>
      <ul>
        {video_tampering_report['Video Tampering Detection Report']["2. Object Tracking Analysis"]["Suspicious Objects Detected"].map((obj, index) => (
          <li key={index}>
            {obj.Object} (Confidence: {obj.Confidence})
          </li>
        ))}
      </ul>

      <h2>3. Face Detection Analysis</h2>
      <p>Total Faces Detected: {video_tampering_report['Video Tampering Detection Report']["3. Face Detection Analysis"]["Total Faces Detected"]}</p>
      <p>Number of Suspiciously Brief Face Appearances: {video_tampering_report['Video Tampering Detection Report']["3. Face Detection Analysis"]["Number of Suspiciously Brief Face Appearances"]}</p>
      <p>{video_tampering_report['Video Tampering Detection Report']["3. Face Detection Analysis"]["Suspicious Faces Detected"]}</p>

      <h2>4. Tampering Detection Summary</h2>
      <p>Tampering Detected: {video_tampering_report['Video Tampering Detection Report']["4. Tampering Detection Summary"]["Tampering Detected"]}</p>
      <h3>Reasons for Potential Tampering Detection:</h3>
      <ul>
        {video_tampering_report['Video Tampering Detection Report']["4. Tampering Detection Summary"]["Reasons for Potential Tampering Detection"].map((reason, index) => (
          <li key={index}>{reason}</li>
        ))}
      </ul>
        </div>)}
        
        </div>

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