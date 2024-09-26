'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ShaderMaterial } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

const VizPage: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Post-processing setup
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, 0.4, 0.85
    );
    composer.addPass(bloomPass);

    // Color transition based on time of day
    const getColorsForTime = (hour: number): [THREE.Color, THREE.Color] => {
      if (hour >= 5 && hour < 8) {
        // Sunrise
        return [new THREE.Color(0x1e4877), new THREE.Color(0xfdb813)];
      } else if (hour >= 8 && hour < 16) {
        // Daytime
        return [new THREE.Color(0x87ceeb), new THREE.Color(0xffffff)];
      } else if (hour >= 16 && hour < 19) {
        // Sunset
        return [new THREE.Color(0xff7e00), new THREE.Color(0x0f2342)];
      } else {
        // Night
        return [new THREE.Color(0x0f0f1f), new THREE.Color(0x000000)];
      }
    };

    const getCurrentColors = (): [THREE.Color, THREE.Color] => {
      const now = new Date();
      const hour = now.getHours() + now.getMinutes() / 60;
      return getColorsForTime(hour);
    };

    // Topographical map shader
    const topoMaterial = new ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        beat: { value: 0 },
        colorA: { value: new THREE.Color(0x1e4877) },
        colorB: { value: new THREE.Color(0xfdb813) },
      },
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying float vElevation;

        // Simplex 3D Noise
        vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod(i, 289.0);
          vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        void main() {
          vUv = uv;
          vec3 pos = position;
          float noiseFreq = 1.5;
          float noiseAmp = 0.5;
          vec3 noisePos = vec3(pos.x * noiseFreq + time, pos.y, pos.z);
          pos.z += snoise(noisePos) * noiseAmp;
          vElevation = pos.z;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        uniform float beat;
        uniform vec3 colorA;
        uniform vec3 colorB;
        varying vec2 vUv;
        varying float vElevation;
        
        void main() {
          vec3 color = mix(colorA, colorB, vUv.y);
          
          // Elevation-based coloring
          color += vec3(0.1, 0.2, 0.3) * vElevation;
          
          // Pulsating effect
          float pulse = sin(beat * 3.14159 * 2.0) * 0.5 + 0.5;
          color += vec3(0.2, 0.0, 0.4) * pulse * 0.2;
          
          // Add some glow lines
          float line = smoothstep(0.1, 0.11, abs(fract(vElevation * 10.0 - time * 0.1) - 0.5));
          color += vec3(0.0, 1.0, 1.0) * line * 0.3;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      wireframe: true,
    });

    const planeGeometry = new THREE.PlaneGeometry(10, 10, 200, 200);
    const topoMesh = new THREE.Mesh(planeGeometry, topoMaterial);
    topoMesh.rotation.x = -Math.PI / 2;
    scene.add(topoMesh);

    // Floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.005,
      color: 0x00ffff,
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Floating text setup
    const createFloatingText = (text: string, size: number, color: string) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 512;
      canvas.height = 256;
      context!.fillStyle = color;
      context!.font = `bold ${size}px "Courier New", monospace`;
      context!.fillText(text, 10, 128);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.8,
      });

      const geometry = new THREE.PlaneGeometry(2, 1);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.z = 2;
      scene.add(mesh);
      return mesh;
    };

    const textMesh = createFloatingText('thespot.lol', 70, '#00ffff');

    camera.position.set(0, 5, 5);
    camera.lookAt(0, 0, 0);

    // Beat simulation
    let beatTime = 0;
    const beatDuration = 0.5; // 120 BPM

    // Color transition
    let currentColors = getCurrentColors();
    let targetColors = currentColors;
    let colorTransitionProgress = 0;
    const colorTransitionDuration = 300; // 5 minutes in seconds

    // Animation loop
    const animate = (time: number) => {
      requestAnimationFrame(animate);

      const deltaTime = time * 0.001;

      // Update color transition
      colorTransitionProgress += deltaTime / colorTransitionDuration;
      if (colorTransitionProgress >= 1) {
        currentColors = targetColors;
        targetColors = getCurrentColors();
        colorTransitionProgress = 0;
      }

      const lerpedColorA = new THREE.Color().lerpColors(
        currentColors[0],
        targetColors[0],
        colorTransitionProgress
      );
      const lerpedColorB = new THREE.Color().lerpColors(
        currentColors[1],
        targetColors[1],
        colorTransitionProgress
      );

      // Update shader uniforms
      topoMaterial.uniforms.time.value = deltaTime;
      topoMaterial.uniforms.colorA.value = lerpedColorA;
      topoMaterial.uniforms.colorB.value = lerpedColorB;
      beatTime += deltaTime;
      if (beatTime > beatDuration) {
        beatTime -= beatDuration;
      }
      topoMaterial.uniforms.beat.value = beatTime / beatDuration;

      // Rotate and move the topographical map
      topoMesh.rotation.z = Math.sin(deltaTime * 0.1) * 0.2;
      topoMesh.position.y = Math.sin(deltaTime * 0.2) * 0.5;

      // Animate floating text
      textMesh.position.x = Math.sin(deltaTime * 0.5) * 0.5;
      textMesh.position.y = Math.cos(deltaTime * 0.3) * 0.3 + 2.5;

      // Glitch effect
      if (Math.random() > 0.99) {
        textMesh.position.x += (Math.random() - 0.5) * 0.1;
        textMesh.position.y += (Math.random() - 0.5) * 0.1;
      }

      // Animate particles
      particlesMesh.rotation.y = deltaTime * 0.05;
      particlesMesh.position.y = Math.sin(deltaTime * 0.2) * 0.2;

      composer.render();
    };

    animate(0);

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
      topoMaterial.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="w-full h-screen" />;
};

export default VizPage;