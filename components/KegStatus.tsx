import React from 'react';
import * as THREE from 'three';

interface KegStatusProps {
  level: number;
  lastPourTime: string;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
}

export default function KegStatus({ level, lastPourTime, scene, camera }: KegStatusProps) {
  React.useEffect(() => {
    // Create a canvas to draw the battery icon
    const canvas = document.createElement('canvas');
    canvas.width = 128; // Increased width to accommodate "Keg" text
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw battery outline
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, 56, 28);
    ctx.fillRect(58, 10, 4, 12);

    // Fill battery based on level
    ctx.fillStyle = level > 20 ? 'green' : 'red';
    ctx.fillRect(4, 4, (52 * level) / 100, 24);

    // Add percentage text with "Keg"
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText(`Keg ${level}%`, 64, 20); // Moved text to the right of the battery

    // Create a sprite using the canvas texture
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(4, 1, 1); // Adjusted scale to accommodate wider canvas
    sprite.position.set(-8, 5, -8); // Adjust position as needed

    scene.add(sprite);

    // Add last pour time text
    const lastPourCanvas = document.createElement('canvas');
    lastPourCanvas.width = 256;
    lastPourCanvas.height = 32;
    const lastPourCtx = lastPourCanvas.getContext('2d');
    if (!lastPourCtx) return;

    lastPourCtx.fillStyle = 'white';
    lastPourCtx.font = '12px Arial';
    const formattedDate = formatDate(lastPourTime);
    lastPourCtx.fillText(`Last pour (>16oz): ${formattedDate}`, 0, 20);

    const lastPourTexture = new THREE.CanvasTexture(lastPourCanvas);
    const lastPourMaterial = new THREE.SpriteMaterial({ map: lastPourTexture });
    const lastPourSprite = new THREE.Sprite(lastPourMaterial);
    lastPourSprite.scale.set(4, 0.5, 1);
    lastPourSprite.position.set(-8, 4, -8); // Adjust position as needed

    scene.add(lastPourSprite);

    return () => {
      scene.remove(sprite);
      scene.remove(lastPourSprite);
    };
  }, [level, lastPourTime, scene, camera]);

  // Helper function to format date without year
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + 
           ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return null; // This component doesn't render anything in the DOM
}