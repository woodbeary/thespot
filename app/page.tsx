'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import PostEntry from './components/PostEntry';
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';

export default function Home() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPostEntry, setShowPostEntry] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Create a topographical terrain
    const geometry = new THREE.PlaneGeometry(20, 20, 128, 128);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = Math.sin(x * 0.5) * Math.sin(y * 0.5) * 2 +
                Math.sin(x * 0.25) * Math.sin(y * 0.25) * 1.5;
      positions.setZ(i, z);
    }
    geometry.computeVertexNormals();

    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    });
    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    scene.add(terrain);

    // Create the hiking trail
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-8, 0.5, -8),
      new THREE.Vector3(-4, 1, -4),
      new THREE.Vector3(0, 1.5, 0),
      new THREE.Vector3(4, 2, 4),
      new THREE.Vector3(8, 2.5, 8),
    ]);

    const points = curve.getPoints(200);
    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
    const trail = new THREE.Line(trailGeometry, trailMaterial);
    scene.add(trail);

    // Add a pulsating sphere to represent "the spot"
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(8, 3, 8);
    scene.add(sphere);

    camera.position.set(0, 10, 15); // Adjusted for a more zoomed-in view

    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.minDistance = 5; // Adjusted for a more zoomed-in view
    controls.maxDistance = 20;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    let trailProgress = 0;
    const dashSize = 0.2;
    const gapSize = 0.1;
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      
      // Animate the trail
      trailProgress += 0.001;
      trailProgress = Math.min(trailProgress, 1);
      trailMaterial.opacity = trailProgress;

      // Update trail vertices visibility with dashed effect
      const visiblePoints = [];
      let accumulatedLength = 0;
      let isDash = true;
      for (let i = 0; i < points.length; i++) {
        if (accumulatedLength / curve.getLength() > trailProgress) break;
        
        if (isDash) {
          visiblePoints.push(points[i]);
        }
        
        if (i < points.length - 1) {
          const segmentLength = points[i].distanceTo(points[i + 1]);
          accumulatedLength += segmentLength;
          if (isDash && accumulatedLength % (dashSize + gapSize) > dashSize) {
            isDash = false;
          } else if (!isDash && accumulatedLength % (dashSize + gapSize) <= dashSize) {
            isDash = true;
          }
        }
      }
      trailGeometry.setFromPoints(visiblePoints);

      // Pulsate the sphere
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.1;
      sphere.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Adjust camera position for mobile
        if (isMobile) {
          camera.position.set(0, 15, 20); // Zoom out more on mobile
        } else {
          camera.position.set(0, 10, 15);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once to set initial size

    // Simulate loading
    setTimeout(() => setIsLoading(false), 2000);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [isMobile]);

  const handleEnter = () => {
    if (cameraRef.current && controlsRef.current) {
      const targetPosition = new THREE.Vector3(8, 3, 8);
      const duration = 2000; // 2 seconds
      const startPosition = cameraRef.current.position.clone();
      const startTime = Date.now();

      const zoomAnimation = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

        cameraRef.current!.position.lerpVectors(startPosition, targetPosition, easeProgress);
        controlsRef.current!.update();

        if (progress < 1) {
          requestAnimationFrame(zoomAnimation);
        } else {
          setShowPostEntry(true);
        }

        rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
      };

      zoomAnimation();
    }
  };

  const handleBack = () => {
    setShowPostEntry(false);
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 10, 15);
      controlsRef.current.update();
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between bg-black text-white overflow-hidden p-4">
      <div ref={mountRef} className="absolute inset-0" />
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="text-4xl font-bold">Loading...</div>
      </div>
      {!showPostEntry && (
        <h1 className="text-2xl md:text-4xl font-bold tracking-wider z-10 mb-4">thespot.lol</h1>
      )}
      <div className="flex flex-col items-center justify-center z-10 space-y-4">
        {!showPostEntry && (
          <Button 
            className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors"
            onClick={handleEnter}
          >
            Enter
          </Button>
        )}
        <p className="text-sm md:text-xl tracking-wide">Riverside, CA</p>
      </div>
      {showPostEntry && (
        <PostEntry onBack={handleBack} />
      )}
    </main>
  );
}
