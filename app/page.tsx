'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function Home() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Create a minimalist terrain
    const geometry = new THREE.PlaneGeometry(20, 20, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    });
    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    scene.add(terrain);

    // Add a pulsating sphere to represent "the spot"
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0, 0.5, 0);
    scene.add(sphere);

    camera.position.set(0, 5, 10);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      
      // Pulsate the sphere
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.1;
      sphere.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Simulate loading
    setTimeout(() => setIsLoading(false), 2000);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-black text-white overflow-hidden">
      <div ref={mountRef} className="absolute inset-0" />
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="text-4xl font-bold">Loading...</div>
      </div>
      <h1 className="absolute top-4 left-4 text-2xl md:text-4xl font-bold tracking-wider z-10">thespot.lol</h1>
      <p className="absolute bottom-4 right-4 text-sm md:text-xl tracking-wide z-10">Riverside, CA</p>
      <button className="absolute bottom-4 left-4 px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors z-10">
        Enter
      </button>
    </main>
  );
}
