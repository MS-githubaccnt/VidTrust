import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { serverUrl } from '../utils/api';
import { Button, TextField, Typography, Box, LinearProgress } from '@mui/material';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL,import.meta.env.VITE_SUPABASE_ANON_KEY);


const UploadVideoToS3WithNativeSdk = () => {
    const [video_exists,setVideo_exists] = useState<Boolean>(false);
    const [video_exists_error,setVideo_exists_error] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [progress1, setProgress1] = useState(0);
    const [progress2, setProgress2] = useState(0);
    const [selectedFile2, setSelectedFile2] = useState<any>();
    const [selectedFile1, setSelectedFile1] = useState<any>();
    const [videoUrl, setVideoUrl] = useState<string>("");
    const [imageUrl, setImageUrl] = useState<string>("");

    const handleFileInput1 = (e: any) => {
        setSelectedFile1(e.target.files[0]);
    }

    const handleFileInput2 = (e: any) => {
        setSelectedFile2(e.target.files[0]);
    }


    const handleTitleChange = (e: any) => {
        setTitle(e.target.value);
    }

    const handleFinalSubmit = async (e: any) => {
        e.preventDefault();
        var date_stamp = new Date()
        const date = `${date_stamp.getDate()} - ${date_stamp.getMonth()} - ${date_stamp.getFullYear()}`
        var storeStruct = {
            title: title,
            imageUrl: imageUrl,
            videoUrl: videoUrl,
            date:date,
        }
        const response = await axios.post(`${serverUrl}/auth/video_url`, storeStruct)
        if (response.status === 200) {
            if(response.data.status === 'success'){
                setImageUrl("");
                setProgress1(0)
                setProgress2(0)
                setVideoUrl("")
                setTitle("")
                setSelectedFile1(null)
                setSelectedFile2(null)
            }
            else if (response.data.status === 'failure'){
                setVideo_exists(true)
                setVideo_exists_error(response.data.message)
                setImageUrl("");
                setProgress1(0)
                setProgress2(0)
                setVideoUrl("")
                setTitle("")
                setSelectedFile1(null)
                setSelectedFile2(null)
            }
            
        }

    }

    const uploadFile1 = async (file: File, bucket: string, setProgress: React.Dispatch<React.SetStateAction<number>>, setUrl: React.Dispatch<React.SetStateAction<string>>) => {
        if (!file) return;
        const fileExt = file.name.split('.').pop();
        if(fileExt==="mkv"){
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;
        console.log("video tak aa gye hai")
        try {
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });
            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);
            console.log(data);
            setUrl(publicUrl);
            setProgress(100);
        } catch (error) {
            console.error('Error uploading file:', error);
            setProgress(0);
        }
        }
        else if(fileExt==="mp4"){
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;
            console.log("video tak aa gye hai")
            try {
                const { data, error } = await supabase.storage
                    .from(bucket)
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false
                    });
                if (error) throw error;
                const { data: { publicUrl } } = supabase.storage
                    .from(bucket)
                    .getPublicUrl(filePath);
                console.log(data);
                setUrl(publicUrl);
                // setProgress(100);
            } catch (error) {
                console.error('Error uploading file:', error);
                setProgress(0);
            }
            const response = await axios.post(`${serverUrl}/auth/mp4_file_handler`,{
                url : videoUrl
            })
            if(response.status === 200){
                console.log(response.data['data'])
                setUrl(response.data['data'])
                setProgress(100)
            }

        }
        
    }


    const uploadFile2 = async (file: File, bucket: string, setProgress: React.Dispatch<React.SetStateAction<number>>, setUrl: React.Dispatch<React.SetStateAction<string>>) => {
        if (!file) return;

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;
        console.log("image tak aa gya hai")

        try {
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);
            console.log(data);
            setUrl(publicUrl);
            setProgress(100);

        } catch (error) {
            console.error('Error uploading file:', error);
            setProgress(0);
        }
    }

    return <Box sx={{
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
    }}>
        <Typography variant="h4" sx={{ color: 'white', mb: 4, fontFamily: 'Space Grotesk, sans-serif' }}>
            Upload Your Video
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

        <Box className="mb-6">
            <Typography variant="body2" className="mb-2">
                Upload your video here: {progress1}%
            </Typography>
            <input
                type="file"
                onChange={handleFileInput1}
                className="mb-2"
            />
            <Button
                variant="contained"
                color="primary"
                onClick={() => uploadFile1(selectedFile1, 'video', setProgress1, setVideoUrl)}
                disabled={!selectedFile1}
                sx={{
                    mb: 2,
                    backgroundColor: '#00ED64',
                    color: 'black',
                    '&:hover': { backgroundColor: 'rgba(0, 237, 100, 0.8)' },
                    '&.Mui-disabled': { backgroundColor: 'rgba(0, 237, 100, 0.3)', color: 'rgba(0, 0, 0, 0.3)' },
                }}
            >
                Upload Video
            </Button>
            {progress1 > 0 && (
                <Box sx={{ width: '100%', mb: 2 }}>
                    <LinearProgress variant="determinate" value={progress1} sx={{ backgroundColor: 'rgba(0, 237, 100, 0.3)', '& .MuiLinearProgress-bar': { backgroundColor: '#00ED64' } }} />
                </Box>
            )}
        </Box>

        <Box className="mb-6">
            <Typography variant="body2" className="mb-2">
                Upload your thumbnail here: {progress2}%
            </Typography>
            <input
                type="file"
                onChange={handleFileInput2}
                className="mb-2"
            />
            <Button
                variant="contained"
                color="primary"
                onClick={() => uploadFile2(selectedFile2, 'images', setProgress2, setImageUrl)}
                disabled={!selectedFile2}
                sx={{
                    mb: 2,
                    backgroundColor: '#00ED64',
                    color: 'black',
                    '&:hover': { backgroundColor: 'rgba(0, 237, 100, 0.8)' },
                    '&.Mui-disabled': { backgroundColor: 'rgba(0, 237, 100, 0.3)', color: 'rgba(0, 0, 0, 0.3)' },
                }}
            >
                Upload Thumbnail
            </Button>
            {progress2 > 0 && (
                <Box sx={{ width: '100%', mb: 2 }}>
                    <LinearProgress variant="determinate" value={progress2} sx={{ backgroundColor: 'rgba(0, 237, 100, 0.3)', '& .MuiLinearProgress-bar': { backgroundColor: '#00ED64' } }} />
                </Box>
            )}
        </Box>

        <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={handleFinalSubmit}
            disabled={!title || !videoUrl || !imageUrl}
            sx={{
                mb: 2,
                backgroundColor: '#00ED64',
                color: 'black',
                '&:hover': { backgroundColor: 'rgba(0, 237, 100, 0.8)' },
                '&.Mui-disabled': { backgroundColor: 'rgba(0, 237, 100, 0.3)', color: 'rgba(0, 0, 0, 0.3)' },
            }}
        >
            Submit
        </Button>
        {video_exists ? `${video_exists_error}`:null}
    </Box>
}

export default UploadVideoToS3WithNativeSdk;