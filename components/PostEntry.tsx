import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PostEntryProps {
  onBack: () => void;
}

const PostEntry: React.FC<PostEntryProps> = ({ onBack }) => {
  const coordinates = "33.884283, -117.472665";

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${coordinates}`;
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
      <p 
        className="text-lg cursor-pointer hover:underline"
        onClick={handleNavigate}
      >
        {coordinates}
      </p>
    </div>
  );
};

export default PostEntry;