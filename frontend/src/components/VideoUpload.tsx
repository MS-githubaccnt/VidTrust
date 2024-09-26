import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { serverUrl } from '../utils/api';
import dotenv from "dotenv";

dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL||"", process.env.SUPABASE_ANON_KEY||"");

const UploadVideoToS3WithNativeSdk = () => {
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
        var storeStruct = {
            title: title,
            imageUrl: imageUrl,
            videoUrl: videoUrl
        }
        const response = await axios.post(`${serverUrl}/auth/video_url`, storeStruct)
        if (response.status === 200) {
            setImageUrl("");
            setProgress1(0)
            setProgress2(0)
            setVideoUrl("")
            setTitle("")
            setSelectedFile1(null)
            setSelectedFile2(null)
        }

    }

    const uploadFile1 = async (file: File, bucket: string, setProgress: React.Dispatch<React.SetStateAction<number>>, setUrl: React.Dispatch<React.SetStateAction<string>>) => {
        if (!file) return;

        const fileExt = file.name.split('.').pop();
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
            // setImageUrl(publicUrl)
            setProgress(100);

        } catch (error) {
            console.error('Error uploading file:', error);
            setProgress(0);
        }
    }

    return <div>
        <div>Video Title :%</div>
        <input type="text" value={title} onChange={handleTitleChange} />
        <br></br>
        <div>Upload your video here : {progress1}%</div>
        <input type="file" onChange={handleFileInput1} />
        <button onClick={() => uploadFile1(selectedFile1, 'video', setProgress1, setVideoUrl)}> Upload to S3</button>
        <br></br>
        <div>Upload your thumbnail here : {progress2}%</div>
        <input type="file" onChange={handleFileInput2} />
        <button onClick={() => uploadFile2(selectedFile2, 'images', setProgress2, setImageUrl)}> Upload to S3</button>
        <br></br>
        <button type='submit' onClick={(e) => handleFinalSubmit(e)}>UPLOAD</button>
    </div>
}

export default UploadVideoToS3WithNativeSdk;











