'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button"

const InteractiveMap = ({ onClose }: { onClose: () => void }) => {
  const [currentLevel, setCurrentLevel] = useState(1);

  const levels = [
    { id: 1, name: 'Gateway', description: 'Where the journey begins' },
    { id: 2, name: 'Gathering', description: 'The heart of thespot.lol' },
    { id: 3, name: 'Retreat', description: 'A place to unwind and reflect' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white text-black p-8 rounded-lg max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4">Explore</h2>
        <div className="mb-4">
          {levels.map(level => (
            <Button
              key={level.id}
              onClick={() => setCurrentLevel(level.id)}
              variant={currentLevel === level.id ? "default" : "outline"}
              className="mr-2 mb-2"
            >
              {level.name}
            </Button>
          ))}
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">{levels.find(l => l.id === currentLevel)?.name}</h3>
          <p>{levels.find(l => l.id === currentLevel)?.description}</p>
        </div>
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

export default InteractiveMap;