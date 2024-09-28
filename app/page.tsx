'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useMediaQuery } from 'react-responsive';
import Image from 'next/image';
import { Button } from "@/components/ui/button"
import PostEntry from '@/components/PostEntry'
import Link from 'next/link';
import TicketPurchase from '@/components/TicketPurchase';
import KegStatus from '@/components/KegStatus';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUsers } from 'react-icons/fa';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import DisableSiteModal from '@/components/DisableSiteModal';

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

interface ProfilePicture {
  id: string;
  src: string;
  position: THREE.Vector3;
}

interface ProfileData {
  id: string;
  src: string;
  name: string;
  bio: string;
  side: 'left' | 'bottom' | 'right';
  objectPosition?: string;
  iconSrc?: string;
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

  const [showTicketPurchase, setShowTicketPurchase] = useState(false);
  const [kegLevel, setKegLevel] = useState(75);
  const [lastPourTime, setLastPourTime] = useState('2023-05-01 14:30');
  
  // Update the profileData state
  const [profileData, setProfileData] = useState<ProfileData[]>([
    { id: 'IMG_5309', src: '/profile/IMG_5309.jpeg', name: 'dirty dan.', bio: '🍑', side: 'left' },
    { id: 'IMG_5311', src: '/profile/IMG_5311.jpeg', name: 'damian.', bio: '"pretty cool guy." - jack', side: 'bottom' },
    { id: 'IMG_5313', src: '/profile/IMG_5313.jpeg', name: 'jack.', bio: '"web guy" - web guy', side: 'right', objectPosition: 'center 20%', iconSrc: '/profile/jaq.png' },
    { id: 'jacob.', src: '/profile/jack.jpeg', iconSrc: '/profile/ranch.png', name: 'jacob', bio: '"mmm." - dan', side: 'bottom', objectPosition: 'center 40%' },
  ]);

  const [showProfileIcon, setShowProfileIcon] = useState(false);
  const [showProfilePictures, setShowProfilePictures] = useState(false);
  const [showDisableSiteModal, setShowDisableSiteModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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

    // Add KegStatus to the scene
    if (sceneRef.current && cameraRef.current) {
      const kegStatusElement = <KegStatus 
        level={kegLevel} 
        lastPourTime={lastPourTime} 
        scene={sceneRef.current} 
        camera={cameraRef.current} 
      />;
      const container = document.createElement('div');
      const root = createRoot(container);
      root.render(kegStatusElement);
    }

    const handleInteraction = (event: MouseEvent | TouchEvent) => {
      if (showDisableSiteModal) return; // Prevent interaction when modal is open

      if (event.type === 'touchstart') {
        event.preventDefault(); // Prevent default touch behavior
      }

      handlePhotoClick(event);
    };

    // Add event listeners for both mouse and touch events
    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [isMobile, photos, kegLevel, lastPourTime, showDisableSiteModal]);

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
    setShowDisableSiteModal(true);
  };

  const handleModalClose = (agreed: boolean) => {
    setShowDisableSiteModal(false);
    setAgreedToTerms(agreed);
    if (agreed) {
      handleZoomIn();
    }
  };

  const handleZoomIn = () => {
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
          // Show the profile icon after zooming in
          setTimeout(() => {
            setShowProfileIcon(true);
          }, 1000); // 1 second after zoom completes
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

  const handlePhotoSelection = (clickedPhoto: Photo) => {
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

  const handleTicketPurchaseClose = () => {
    setShowTicketPurchase(false);
  };

  const handleProfileIconClick = () => {
    setShowProfilePictures(prev => !prev);
  };

  const handlePhotoClick = (event: MouseEvent | TouchEvent) => {
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    // Get the correct client coordinates
    let clientX: number, clientY: number;
    if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else if (event instanceof TouchEvent) {
      // Check if there are any touches
      if (event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        return;
      }
    } else {
      return;
    }

    // Calculate mouse position in normalized device coordinates
    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, cameraRef.current!);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(photos.map(photo => photo.hitboxMesh!));

    if (intersects.length > 0) {
      const clickedPhoto = photos.find(photo => photo.hitboxMesh === intersects[0].object);
      if (clickedPhoto) {
        handlePhotoSelection(clickedPhoto);
      }
    }
  };

  return (
    <>
      <main className={`relative bg-black text-white overflow-hidden h-screen ${showDisableSiteModal ? 'pointer-events-none' : 'pointer-events-auto'}`}>
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

          <Button
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 hover:bg-blue-600 text-white z-50 pointer-events-auto"
            onClick={() => setShowTicketPurchase(true)}
          >
            the events.
          </Button>
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
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white border border-white rounded-full p-2 hover:bg-white hover-text-black transition-colors"
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

        <AnimatePresence>
          {showProfileIcon && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
            >
              <button
                onClick={handleProfileIconClick}
                className="bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-all duration-300"
              >
                <FaUsers className="text-white text-2xl" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showProfilePictures && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-24 left-0 right-0 flex justify-center items-center z-50 px-4"
            >
              <div className="flex justify-center items-center space-x-4 max-w-full overflow-x-auto">
                {profileData.map((profile) => (
                  <Sheet key={profile.id}>
                    <SheetTrigger asChild>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-12 h-12 rounded-full overflow-hidden cursor-pointer flex-shrink-0"
                      >
                        <Image
                          src={profile.iconSrc || profile.src}
                          alt={`Profile ${profile.name}`}
                          width={48}
                          height={48}
                          className="object-cover filter grayscale"
                          style={{ objectPosition: profile.side === 'right' ? profile.objectPosition : 'center' }}
                        />
                      </motion.div>
                    </SheetTrigger>
                    <SheetContent 
                      side={profile.side} 
                      className={`${profile.side === 'bottom' ? 'w-full h-[400px]' : 'w-[300px] sm:w-[400px]'} flex flex-col items-center justify-center`}
                    >
                      <div className={`flex ${profile.side === 'bottom' ? 'flex-row' : 'flex-col'} items-center space-y-4 w-full h-full`}>
                        <div className={`${profile.side === 'bottom' ? 'w-1/2 h-full' : 'w-full h-2/3'} relative`}>
                          <Image
                            src={profile.src}
                            alt={`Profile ${profile.name}`}
                            layout="fill"
                            objectFit="cover"
                            className="filter grayscale"
                            style={{ objectPosition: profile.side === 'right' ? profile.objectPosition : 'center' }}
                          />
                        </div>
                        <div className={`${profile.side === 'bottom' ? 'w-1/2 pl-4' : 'w-full'} flex flex-col items-center justify-center`}>
                          <h2 className="text-2xl font-bold">{profile.name}</h2>
                          <p className="text-center mt-2">{profile.bio}</p>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      {showTicketPurchase && (
        <TicketPurchase onClose={handleTicketPurchaseClose} />
      )}
      {showDisableSiteModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <DisableSiteModal onClose={handleModalClose} />
        </div>
      )}
    </>
  );
}