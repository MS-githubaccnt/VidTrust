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
  const [selectedVideo, setSelectedVideo] = useState<VideoUrl | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const get_video_urls = async () => {
    try {
      const response = await axios.get<VideoUrl[]>(`${serverUrl}/auth/video_fetch_url`);
      setUrls(response.data);
    } catch (err) {
      console.error("Error fetching video URLs:", err);
    }
  };

  useEffect(() => {
    get_video_urls();
  }, []); 

  const playVideo = (video: VideoUrl) => {
    setSelectedVideo(video);
    setIsVideoPlaying(true);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
    setIsVideoPlaying(false);
  };

  return (
    <div className="container mx-auto p-4">
      {isVideoPlaying && selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-4xl w-full">
            <video 
              src={selectedVideo.videoUrl} 
              controls 
              autoPlay 
              className="w-full"
            >
              Your browser does not support the video tag.
            </video>
            <h2 className="text-xl font-bold mt-2">{selectedVideo.title}</h2>
            <button 
              onClick={closeVideo}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {urls.map((video) => (
          <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={video.imageUrl} alt={video.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-lg font-semibold truncate">{video.title}</h3>
              <button 
                onClick={() => playVideo(video)}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Play
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideosFetch;