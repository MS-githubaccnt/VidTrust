import React, { useState, useEffect } from "react";
import axios from "axios";
import { serverUrl } from '../utils/api';


interface VideoUrl {
  id: string;
  email: string;
  title: string;
  imageUrl: string;
  videoUrl: string;
}

const VideosFetch: React.FC = () => {
  const [urls, setUrls] = useState<VideoUrl[]>([]);

  const get_video_urls = async () => {
    try {
      const response = await axios.get<VideoUrl[]>(`${serverUrl}/auth/video_fetch_url`);
      setUrls(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    get_video_urls();
  }, [,urls]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {urls.map((video) => (
        <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <img src={video.imageUrl} alt={video.title} className="w-full h-48 object-cover" />
          <div className="p-4">
            <h3 className="text-lg font-semibold truncate">{video.title}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideosFetch;