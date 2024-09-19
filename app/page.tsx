'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useMediaQuery } from 'react-responsive';
import Image from 'next/image';
import { Button } from "@/components/ui/button"
import PostEntry from '@/components/PostEntry'
import Link from 'next/link';

// Update the Photo interface
interface Photo {
  id: string;
  src: string;
  position: THREE.Vector3;
  caption: string;
  mesh?: THREE.Mesh;
  hitboxMesh?: THREE.Mesh;
  clicked: boolean;
}

// Add this interface for weather data
interface WeatherData {
  temperature: number;
  description: string;
}

export default function Home() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [showPostEntry, setShowPostEntry] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  // Add new state for photos and selected photo
  const [photos, setPhotos] = useState<Photo[]>([
    { id: 'IMG_5268', src: '/IMG_5268.jpeg', position: new THREE.Vector3(-6, 3, -3), caption: "Goth vibes: Iron pickaxe meets dirt block", clicked: false },
    { id: 'IMG_5286', src: '/IMG_5286.jpeg', position: new THREE.Vector3(2, 3.5, -5), caption: "Base camp setup: Creeper lurking nearby", clicked: false },
    { id: 'IMG_5293', src: '/IMG_5293.jpeg', position: new THREE.Vector3(5, 4, 4), caption: "Post-build chill: Beer and laptop on a crafting table", clicked: false },
    { id: 'IMG_5295', src: '/IMG_5295.jpeg', position: new THREE.Vector3(-3, 3.2, 6), caption: "Hilltop base: Panoramic view of the biome", clicked: false },
  ]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [hoveredPhoto, setHoveredPhoto] = useState<Photo | null>(null);

  const [showCoordinates, setShowCoordinates] = useState(false);
  const coordinates = { lat: 33.8842844, lng: -117.4729111 };

  // Add this new state for weather data
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

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

    // Create photo icons with larger hitbox and highlight
    const iconGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const iconMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const clickedMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const hitboxSize = isMobile ? 1 : 0.5;
    const hitboxGeometry = new THREE.SphereGeometry(hitboxSize, 32, 32);
    const hitboxMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff, 
      transparent: true, 
      opacity: 0 
    });

    photos.forEach(photo => {
      const photoMesh = new THREE.Mesh(iconGeometry, photo.clicked ? clickedMaterial : iconMaterial);
      photoMesh.position.copy(photo.position);
      scene.add(photoMesh);

      const hitboxMesh = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
      hitboxMesh.position.copy(photo.position);
      scene.add(hitboxMesh);

      (photo as Photo & { mesh: THREE.Mesh, hitboxMesh: THREE.Mesh }).mesh = photoMesh;
      (photo as Photo & { mesh: THREE.Mesh, hitboxMesh: THREE.Mesh }).hitboxMesh = hitboxMesh;
    });

    // Force a re-render of the scene
    renderer.render(scene, camera);

    // Add raycaster for photo hover and click detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      const touch = event.touches[0];
      mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
      handleInteraction();
    };

    const handleInteraction = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      for (let i = 0; i < intersects.length; i++) {
        const intersectedObject = intersects[i].object;
        const clickedPhoto = photos.find(photo => 
          photo.hitboxMesh === intersectedObject || photo.mesh === intersectedObject
        );
        
        if (clickedPhoto) {
          handlePhotoClick(clickedPhoto);
          break;
        }
      }
    };

    const onMouseClick = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      handleInteraction();
    };

    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      let hoveredPhotoFound = false;
      photos.forEach(photo => {
        if (photo.mesh) {
          photo.mesh.material = photo.clicked ? clickedMaterial : iconMaterial;
        }
      });

      for (let i = 0; i < intersects.length; i++) {
        const intersectedObject = intersects[i].object;
        const hoveredPhoto = photos.find(photo => 
          photo.hitboxMesh === intersectedObject || photo.mesh === intersectedObject
        );
        if (hoveredPhoto && hoveredPhoto.mesh) {
          hoveredPhoto.mesh.material = highlightMaterial;
          setHoveredPhoto(hoveredPhoto);
          hoveredPhotoFound = true;
          document.body.style.cursor = 'pointer';
          break;
        }
      }

      if (!hoveredPhotoFound) {
        setHoveredPhoto(null);
        document.body.style.cursor = 'default';
      }

      renderer.render(scene, camera);
    };

    if (isMobile) {
      window.addEventListener('touchstart', onTouchStart);
    } else {
      window.addEventListener('click', onMouseClick);
      window.addEventListener('mousemove', onMouseMove);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (isMobile) {
        window.removeEventListener('touchstart', onTouchStart);
      } else {
        window.removeEventListener('click', onMouseClick);
        window.removeEventListener('mousemove', onMouseMove);
      }
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [isMobile, photos]);

  // Add this new useEffect for fetching weather data
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=33.95&longitude=-117.40&current_weather=true&temperature_unit=fahrenheit');
        const data = await response.json();
        setWeatherData({
          temperature: data.current_weather.temperature,
          description: getWeatherDescription(data.current_weather.weathercode)
        });
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    fetchWeatherData();
    const intervalId = setInterval(fetchWeatherData, 600000); // Update every 10 minutes

    return () => clearInterval(intervalId);
  }, []);

  // Add this helper function to get weather description
  const getWeatherDescription = (code: number): string => {
    if (code <= 3) return 'Clear';
    if (code <= 48) return 'Cloudy';
    if (code <= 67) return 'Rainy';
    if (code <= 77) return 'Snowy';
    return 'Stormy';
  };

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
          setShowCoordinates(true);
        }

        rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
      };

      zoomAnimation();
    }
  };

  const handleBack = () => {
    setShowCoordinates(false);
    if (cameraRef.current && controlsRef.current) {
      const startPosition = cameraRef.current.position.clone();
      const targetPosition = new THREE.Vector3(0, 10, 15);
      const duration = 2000; // 2 seconds
      const startTime = Date.now();

      const zoomOutAnimation = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

        cameraRef.current!.position.lerpVectors(startPosition, targetPosition, easeProgress);
        controlsRef.current!.update();

        if (progress < 1) {
          requestAnimationFrame(zoomOutAnimation);
        }

        rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
      };

      zoomOutAnimation();
    }
  };

  const handlePhotoClick = (clickedPhoto: Photo) => {
    if (cameraRef.current && controlsRef.current && sceneRef.current) {
      const targetPosition = clickedPhoto.position.clone().add(new THREE.Vector3(0, 0, 2));
      const duration = 1000; // 1 second
      const startPosition = cameraRef.current.position.clone();
      const startTime = Date.now();

      const zoomAnimation = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

        cameraRef.current!.position.lerpVectors(startPosition, targetPosition, easeProgress);
        controlsRef.current!.target.copy(clickedPhoto.position);
        controlsRef.current!.update();

        if (progress < 1) {
          requestAnimationFrame(zoomAnimation);
        } else {
          // Update clicked state in localStorage and state
          const clickedPhotos = JSON.parse(localStorage.getItem('clickedPhotos') || '{}');
          clickedPhotos[clickedPhoto.id] = true;
          localStorage.setItem('clickedPhotos', JSON.stringify(clickedPhotos));

          setPhotos(prevPhotos => prevPhotos.map(photo => {
            if (photo.id === clickedPhoto.id) {
              if (photo.mesh) {
                (photo.mesh.material as THREE.MeshBasicMaterial).color.setHex(0x00ff00);
              }
              return { ...photo, clicked: true };
            }
            return photo;
          }));

          setSelectedPhoto(clickedPhoto);
        }

        rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
      };

      zoomAnimation();
    }
  };

  // Add this useEffect to load clicked states from localStorage on component mount
  useEffect(() => {
    const clickedPhotos = JSON.parse(localStorage.getItem('clickedPhotos') || '{}');
    setPhotos(prevPhotos => prevPhotos.map(photo => ({
      ...photo,
      clicked: !!clickedPhotos[photo.id]
    })));
  }, []);

  const handleClosePhoto = () => {
    setSelectedPhoto(null);
    if (cameraRef.current && controlsRef.current) {
      const currentPosition = cameraRef.current.position.clone();
      const direction = currentPosition.clone().normalize();
      const targetPosition = direction.multiplyScalar(15); // Keep the same direction, but set distance to 15

      const duration = 1000; // 1 second
      const startPosition = currentPosition;
      const startTime = Date.now();

      const zoomOutAnimation = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

        cameraRef.current!.position.lerpVectors(startPosition, targetPosition, easeProgress);
        controlsRef.current!.target.set(0, 0, 0);
        controlsRef.current!.update();

        if (progress < 1) {
          requestAnimationFrame(zoomOutAnimation);
        }

        rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
      };

      zoomOutAnimation();
    }
  };

  const handleCoordinateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const androidChrome = /android/.test(userAgent) && /chrome/.test(userAgent);
    
    const label = encodeURIComponent("End of Victoria Ave");
    const appleUrl = `maps:?q=${coordinates.lat},${coordinates.lng}`;
    const googleUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}&query_place_id=${label}`;
    const fallbackUrl = `https://www.openstreetmap.org/?mlat=${coordinates.lat}&mlon=${coordinates.lng}&zoom=16`;

    if (isIOS) {
      window.location.href = appleUrl;
    } else if (androidChrome) {
      window.location.href = `intent://maps.google.com/maps?daddr=${coordinates.lat},${coordinates.lng}&amp;ll=;z=16&amp;q=${label}#Intent;scheme=http;package=com.google.android.apps.maps;end`;
    } else {
      window.open(googleUrl, '_blank');
    }
  };

  return (
    <main className="relative bg-black text-white overflow-hidden h-screen">
      <div ref={mountRef} className="absolute inset-0" />
      <div className="relative z-10 flex flex-col justify-between h-full p-4 pointer-events-none">
        {!showCoordinates && (
          <div className="w-full pointer-events-auto">
            <h1 className="text-2xl md:text-4xl font-bold tracking-wider">thespot.lol</h1>
          </div>
        )}
        {!showCoordinates && (
          <div className="absolute bottom-[15%] left-0 right-0 flex justify-between items-end w-full px-4">
            <p className="text-sm md:text-xl tracking-wide pointer-events-auto">Riverside, CA</p>
            <Button 
              className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors pointer-events-auto"
              onClick={handleEnter}
            >
              Enter
            </Button>
          </div>
        )}
      </div>
      {showCoordinates && (
        <div className="absolute inset-0 z-20 bg-black bg-opacity-50 flex flex-col items-center justify-center pointer-events-auto">
          <Button
            className="absolute top-4 left-4 text-white"
            onClick={handleBack}
          >
            ← Back
          </Button>
          <div className="text-center">
            <Link 
              href={`https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={handleCoordinateClick}
            >
              <p className="text-2xl md:text-3xl font-bold mb-2">{`${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}`}</p>
              <p className="text-lg md:text-xl">End of Victoria Ave</p>
            </Link>
          </div>
        </div>
      )}
      {showPostEntry && (
        <div className="absolute inset-0 z-30">
          <PostEntry onBack={handleBack} />
        </div>
      )}
      {selectedPhoto && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative polaroid-frame">
            <Image
              src={selectedPhoto.src}
              alt={`Photo ${selectedPhoto.id}`}
              width={800}
              height={600}
              className={`max-w-full max-h-[60vh] object-cover natural-image ${
                selectedPhoto.id === 'IMG_5295' ? 'object-top' : 'object-center'
              }`}
            />
            <div className="polaroid-caption">
              <p>{selectedPhoto.caption}</p>
            </div>
            <Button
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white border border-white rounded-full p-2 hover:bg-white hover:text-black transition-colors"
              onClick={handleClosePhoto}
            >
              Close
            </Button>
          </div>
        </div>
      )}
      
      {/* Add this new div for weather display */}
      {weatherData && (
        <div className="absolute top-4 right-4 text-white z-20">
          <p className="text-lg font-bold">{`${weatherData.temperature}°F`}</p>
          <p className="text-sm">{weatherData.description}</p>
        </div>
      )}
    </main>
  );
}
