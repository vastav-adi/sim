import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const GalaxyParticleSystem = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    let scene, camera, renderer, particles, controls, galaxyRotation;
    let animationFrameId;

    const init = () => {
      // Scene setup
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      mountRef.current.appendChild(renderer.domElement);

      // Camera position
      camera.position.z = 5;

      // Orbit controls
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.rotateSpeed = 0.5;

      // Galaxy rotation object
      galaxyRotation = new THREE.Object3D();
      scene.add(galaxyRotation);

      // Create particles
      const particleCount = 10000;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);

      const galaxyRadius = 2;
      const galaxyThickness = 0.5;

      for (let i = 0; i < particleCount; i++) {
        // Position
        const distance = Math.random() * galaxyRadius;
        const theta = Math.random() * 2 * Math.PI;
        const y = (Math.random() - 0.5) * galaxyThickness;

        positions[i * 3] = distance * Math.cos(theta);
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = distance * Math.sin(theta);

        // Color
        const mixedColor = new THREE.Color();
        const insideColor = new THREE.Color(0xff6030);
        const outsideColor = new THREE.Color(0x1b3984);
        mixedColor.lerpColors(insideColor, outsideColor, distance / galaxyRadius);
        
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;

        // Size
        sizes[i] = Math.random() * 0.1 + 0.01;
      }

      particles = new THREE.BufferGeometry();
      particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
        },
        vertexShader: `
          attribute float size;
          varying vec3 vColor;
          uniform float time;
          void main() {
            vColor = color;
            vec3 pos = position;
            float angle = atan(pos.z, pos.x) + distance(pos, vec3(0.0)) * 0.2;
            float radius = length(pos.xz);
            pos.x = radius * cos(angle);
            pos.z = radius * sin(angle);
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          void main() {
            if (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;
            gl_FragColor = vec4(vColor, 1.0);
          }
        `,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        vertexColors: true
      });

      const particleSystem = new THREE.Points(particles, material);
      galaxyRotation.add(particleSystem);

      // Animation function
      const animate = () => {
        controls.update();
        
        const time = Date.now() * 0.001;
        material.uniforms.time.value = time;

        // Rotate the galaxy
        galaxyRotation.rotation.y += 0.001; // Adjust this value to change rotation speed

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
      };

      animate();
    };

    init();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

const LandingPage = () => {
  return (
    <div style={{ position: 'relative' }}>
      <GalaxyParticleSystem />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        color: 'white',
        zIndex: 1,
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
      }}>
        <h1>Welcome to Inifinty</h1>
        <p>Explore the cosmic wonders</p>
      </div>
    </div>
  );
};

export default LandingPage;