'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const SecretEntry = ({ onClose }: { onClose: () => void }) => {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === '32') {
      setMessage('Welcome to thespot.lol');
    } else {
      setMessage('Incorrect. Try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white text-black p-8 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Enter</h2>
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code"
            className="mb-4"
          />
          <Button type="submit">Submit</Button>
        </form>
        {message && <p className="mt-4 text-center">{message}</p>}
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    </div>
  );
};

export default SecretEntry;