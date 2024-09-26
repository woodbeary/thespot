import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { X } from 'lucide-react'; // Import the X icon from lucide-react

interface DisableSiteModalProps {
  onClose: (agreed: boolean) => void;
}

const DisableSiteModal: React.FC<DisableSiteModalProps> = ({ onClose }) => {
  const [agreed, setAgreed] = useState(false);

  const handleEnter = () => {
    onClose(agreed);
  };

  const handleClose = () => {
    onClose(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white text-black p-8 rounded-lg max-w-md w-full text-center relative">
        <button 
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4">Private Property Notice</h2>
        <p className="mb-6">This website is for a private property. Access is by invitation only. No trespassing allowed.</p>
        <div className="mb-4">
          <label className="flex items-center justify-center">
            <input 
              type="checkbox" 
              checked={agreed} 
              onChange={() => setAgreed(!agreed)} 
              className="mr-2"
            />
            I agree to the terms and conditions
          </label>
        </div>
        <Button 
          onClick={handleEnter} 
          disabled={!agreed}
        >
          Enter Site
        </Button>
      </div>
    </div>
  );
};

export default DisableSiteModal;