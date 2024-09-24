import React ,{useState} from 'react';
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

    const [progress , setProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<any>();

    const handleFileInput = (e:any) => {
        setSelectedFile(e.target.files[0]);
    }

    const uploadFile = async (file:File) => {

        const params = {
            ACL: 'public-read',
            Body: file,
            Bucket: S3_BUCKET,
            Key: file.name
        };

        myBucket.putObject(params)
            .on('httpUploadProgress', (evt) => {
                setProgress(Math.round((evt.loaded / evt.total) * 100))
            })
            .send((err) => {
              if (err) {
                console.error(err);
              } else {
                console.log('Upload successful!');
                const uploadedObjectUrl = `https://s3.${REGION}.amazonaws.com/${S3_BUCKET}/${file.name}`;
                console.log(`Uploaded object URL: ${uploadedObjectUrl}`);
              }
            })
        const response = await axios.post(`${serverUrl}/auth/video_url`,{
          url : `https://s3.${REGION}.amazonaws.com/${S3_BUCKET}/${file.name}`
        })
        console.log(response);
    }


    return <div>
        <div>Upload your video here : {progress}%</div>
        <input type="file" onChange={handleFileInput}/>
        <button onClick={() => uploadFile(selectedFile)}> Upload to S3</button>
    </div>
}

export default UploadVideoToS3WithNativeSdk;