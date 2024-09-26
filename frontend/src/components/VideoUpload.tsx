import {useState} from 'react';
import AWS from 'aws-sdk'
import axios from 'axios';

import { serverUrl } from '../utils/api';

const S3_BUCKET ='YOUR_BUCKET_NAME_HERE';
const REGION ='YOUR_DESIRED_REGION_HERE';


AWS.config.update({
    accessKeyId: 'YOUR_ACCESS_KEY_HERE',
    secretAccessKey: 'YOUR_SECRET_ACCESS_KEY_HERE'
})

const myBucket = new AWS.S3({
    params: { Bucket: S3_BUCKET},
    region: REGION,
})

const UploadVideoToS3WithNativeSdk = () => {
    const [title,setTitle] = useState<string>("");
    const [progress1 , setProgress1] = useState(0);
    const [progress2 , setProgress2] = useState(0);
    const [selectedFile2, setSelectedFile2] = useState<any>();
    const [selectedFile1, setSelectedFile1] = useState<any>();
    const [videoUrl,setVideoUrl] = useState<string>("");
    const [imageUrl,setImageUrl] = useState<string>("");

    const handleFileInput1 = (e:any) => {
        setSelectedFile1(e.target.files[0]);
    }

    const handleFileInput2 = (e:any) => {
        setSelectedFile2(e.target.files[0]);
    }


    const handleTitleChange = (e:any) =>{
        setTitle(e.target.value);
    }

    const handleFinalSubmit = async (e:any) =>{
      e.preventDefault();
      var storeStruct = {
        title:title,
        imageUrl:imageUrl,
        videoUrl:videoUrl
      }
      const response = await axios.post(`${serverUrl}/auth/video_url`,storeStruct)
      if(response.status === 200){
        console.log("")
      }

    }


    const uploadFile1 = async (file:File) => {

        const params = {
            ACL: 'public-read',
            Body: file,
            Bucket: S3_BUCKET,
            Key: file.name
        };

        myBucket.putObject(params)
            .on('httpUploadProgress', (evt) => {
                setProgress1(Math.round((evt.loaded / evt.total) * 100))
            })
            .send((err) => {
              if (err) {
                console.error(err);
              } else {
                console.log('Upload successful!');
                const uploadedVideoUrl = `https://s3.${REGION}.amazonaws.com/${S3_BUCKET}/${file.name}`;
                console.log(`Uploaded object URL: ${uploadedVideoUrl}`);
                setVideoUrl(uploadedVideoUrl)
              }
            })
    }

    const uploadFile2 = async (file:File) => {

        const params = {
            ACL: 'public-read',
            Body: file,
            Bucket: S3_BUCKET,
            Key: file.name
        };

        myBucket.putObject(params)
            .on('httpUploadProgress', (evt) => {
                setProgress2(Math.round((evt.loaded / evt.total) * 100))
            })
            .send((err) => {
              if (err) {
                console.error(err);
              } else {
                console.log('Upload successful!');
                const uploadedImageUrl = `https://s3.${REGION}.amazonaws.com/${S3_BUCKET}/${file.name}`;
                console.log(`Uploaded object URL: ${uploadedImageUrl}`);
                setImageUrl(uploadedImageUrl);
              }
            })
    }


    return <div>
        <div>Video Title :%</div>
        <input type="text" value={title}  onChange={handleTitleChange}/>
        <br></br>
        <div>Upload your video here : {progress1}%</div>
        <input type="file" onChange={handleFileInput2}/>
        <button onClick={() => uploadFile1(selectedFile1)}> Upload to S3</button>
        <br></br>
        <div>Upload your thumbnail here : {progress2}%</div>
        <input type="file" onChange={handleFileInput1}/>
        <button onClick={() => uploadFile2(selectedFile2)}> Upload to S3</button>
        <br></br>
        <button type='submit' onClick={(e)=>handleFinalSubmit(e)}>UPLOAD</button>
    </div>
}

export default UploadVideoToS3WithNativeSdk;