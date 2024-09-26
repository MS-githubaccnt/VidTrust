import React from 'react';
import axios from 'axios';
import { serverUrl } from '../utils/api';

const LoginPage: React.FC = () => {

  const handleLogin = async () => {
    try {
      const { data: { url } } = await axios.get(`${serverUrl}/auth/url`);
      window.location.assign(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Login as Content Creator</h2>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-500"
        >
          Login with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;