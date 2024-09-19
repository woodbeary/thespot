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
    // Calculate estimated pours remaining
    const standardKegVolume = 15.5 * 128; // 15.5 gallons in ounces (1,984 oz)
    const pourSize = 12; // 12 oz pour for Modelo
    const totalPours = Math.floor(standardKegVolume / pourSize); // 165 total pours
    const remainingVolume = (standardKegVolume * level) / 100;
    const estimatedPoursRemaining = Math.floor(remainingVolume / pourSize);

    // Create a canvas to draw the battery icon
    const canvas = document.createElement('canvas');
    canvas.width = 200;
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

    // Add percentage text with "Keg" and estimated pours
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText(`Keg ${level}%`, 64, 15);
    ctx.fillText(`${estimatedPoursRemaining}/${totalPours} pours`, 64, 30);

    // Create a sprite using the canvas texture
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(6, 1, 1);
    sprite.position.set(-7, 5, -8);

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
    lastPourCtx.fillText(`Last pour (>12oz): ${formattedDate}`, 0, 20);

    const lastPourTexture = new THREE.CanvasTexture(lastPourCanvas);
    const lastPourMaterial = new THREE.SpriteMaterial({ map: lastPourTexture });
    const lastPourSprite = new THREE.Sprite(lastPourMaterial);
    lastPourSprite.scale.set(4, 0.5, 1);
    lastPourSprite.position.set(-8, 4, -8);

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