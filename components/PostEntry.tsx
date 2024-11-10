import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PostEntryProps {
  onBack: () => void;
}

const PostEntry: React.FC<PostEntryProps> = ({ onBack }) => {
  const handleNavigate = () => {
    const lat = process.env.NEXT_PUBLIC_LAT;
    const lng = process.env.NEXT_PUBLIC_LNG;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-white p-4">
      <ArrowLeft
        className="absolute top-4 left-4 cursor-pointer hover:text-gray-300 transition-colors"
        size={24}
        onClick={onBack}
      />
      <p className="mb-8 text-lg">End of Victoria Ave</p>
      <button 
        className="text-lg cursor-pointer hover:underline"
        onClick={handleNavigate}
      >
        View Location
      </button>
    </div>
  );
};

export default PostEntry;