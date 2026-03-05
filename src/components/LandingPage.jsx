import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Button } from 'antd';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * 3D Landing Page Component
 * 
 * Features:
 * - Dark futuristic theme with WebGL (Three.js)
 * - Animated 3D floating objects
 * - Cursor-responsive interactive elements
 * - Smooth parallax scrolling
 * - Cinematic animations
 * - Mobile-responsive
 */
export const LandingPage = ({ onEnter = () => {} }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const objectsRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.Fog(0x0f172a, 100, 1000);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 50;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x1a428b, 1, 100);
    pointLight1.position.set(20, 30, 20);
    pointLight1.castShadow = true;
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x22c55e, 0.8, 80);
    pointLight2.position.set(-20, -30, 30);
    scene.add(pointLight2);

    // Create 3D objects
    const createFloatingObject = () => {
      const shapeTypes = [
        () => {
          // Rotating cube
          const geometry = new THREE.BoxGeometry(4, 4, 4);
          const material = new THREE.MeshPhongMaterial({
            color: 0x1a428b,
            emissive: 0x0d2557,
            wireframe: false,
          });
          return new THREE.Mesh(geometry, material);
        },
        () => {
          // Sphere with glow
          const geometry = new THREE.SphereGeometry(3, 32, 32);
          const material = new THREE.MeshPhongMaterial({
            color: 0x22c55e,
            emissive: 0x11a34a,
            wireframe: false,
          });
          return new THREE.Mesh(geometry, material);
        },
        () => {
          // Pyramid
          const geometry = new THREE.TetrahedronGeometry(4, 0);
          const material = new THREE.MeshPhongMaterial({
            color: 0xf59e0b,
            emissive: 0xb45309,
            wireframe: false,
          });
          return new THREE.Mesh(geometry, material);
        },
        () => {
          // Torus (donut shape)
          const geometry = new THREE.TorusGeometry(4, 1.5, 16, 100);
          const material = new THREE.MeshPhongMaterial({
            color: 0x06b6d4,
            emissive: 0x0d9488,
            wireframe: false,
          });
          return new THREE.Mesh(geometry, material);
        },
      ];

      const shape = shapeTypes[Math.floor(Math.random() * shapeTypes.length)]();
      shape.position.x = (Math.random() - 0.5) * 100;
      shape.position.y = (Math.random() - 0.5) * 100;
      shape.position.z = (Math.random() - 0.5) * 50 - 25;
      shape.rotation.x = Math.random() * Math.PI;
      shape.rotation.y = Math.random() * Math.PI;

      shape.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.01,
          z: (Math.random() - 0.5) * 0.01,
        },
        initialPosition: shape.position.clone(),
        floatSpeed: Math.random() * 0.002 + 0.001,
        floatAmount: Math.random() * 5 + 3,
      };

      scene.add(shape);
      return shape;
    };

    // Create multiple objects
    for (let i = 0; i < 8; i++) {
      objectsRef.current.push(createFloatingObject());
    }

    // Stars background
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.6,
    });

    const starsVertices = [];
    for (let i = 0; i < 300; i++) {
      starsVertices.push(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
      );
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(starsVertices), 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Mouse tracking
    const onMouseMove = (event) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    // Scroll tracking for parallax
    const onScroll = () => {
      scrollRef.current = window.scrollY;
    };

    // Window resize
    const onWindowResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onWindowResize);

    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Update objects
      objectsRef.current.forEach((obj) => {
        // Rotation
        obj.rotation.x += obj.userData.rotationSpeed.x;
        obj.rotation.y += obj.userData.rotationSpeed.y;
        obj.rotation.z += obj.userData.rotationSpeed.z;

        // Floating animation
        obj.position.y += Math.sin(Date.now() * obj.userData.floatSpeed) * 0.01;

        // Cursor interaction - objects follow mouse
        obj.position.x += (mouseRef.current.x * 30 - obj.position.x) * 0.02;
        obj.position.z += (mouseRef.current.y * 30 - obj.position.z) * 0.02;
      });

      // Camera slight movement with parallax
      camera.position.x += (mouseRef.current.x * 5 - camera.position.x) * 0.1;
      camera.position.y += (mouseRef.current.y * 5 - camera.position.y) * 0.1;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    // Show content after short delay
    setTimeout(() => setShowContent(true), 500);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onWindowResize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#0f172a',
      }}
    >
      {/* Hero Content Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        {/* Animated gradient blur background */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at 50% 50%, rgba(26, 66, 139, 0.1) 0%, transparent 70%)',
            animation: 'pulse 4s ease-in-out infinite',
          }}
        />

        {/* Main content */}
        <div
          style={{
            textAlign: 'center',
            color: '#e5e7eb',
            maxWidth: 700,
            padding: 20,
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1s ease-out',
          }}
        >
          {/* Logo/Badge */}
          <div
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: 'rgba(26, 66, 139, 0.2)',
              border: '1px solid rgba(26, 66, 139, 0.4)',
              borderRadius: 20,
              marginBottom: 24,
              fontSize: 12,
              color: '#1a428b',
              fontWeight: 600,
              animation: 'fadeInUp 0.8s ease-out 0.1s both',
            }}
          >
            <Sparkles size={12} style={{ display: 'inline', marginRight: 6 }} />
            Next Generation Documentation AI
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontSize: 'clamp(28px, 8vw, 56px)',
              fontWeight: 700,
              marginBottom: 16,
              background: 'linear-gradient(135deg, #1a428b 0%, #22c55e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'fadeInUp 0.8s ease-out 0.2s both',
            }}
          >
            CEISA Doc Generator
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 'clamp(14px, 3vw, 18px)',
              color: '#d1d5db',
              marginBottom: 32,
              lineHeight: 1.6,
              animation: 'fadeInUp 0.8s ease-out 0.3s both',
            }}
          >
            Mengubah dokumentasi proyek menjadi pengalaman cerdas dengan OCR, AI simulation,
            dan template standar Bea Cukai Indonesia
          </p>

          {/* Features Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 32,
              animation: 'fadeInUp 0.8s ease-out 0.4s both',
            }}
          >
            {[
              { icon: '🔍', title: 'Advanced OCR', desc: 'Baca dokumen scanned otomatis' },
              { icon: '🤖', title: 'AI Analysis', desc: 'Monte Carlo project simulation' },
              { icon: '🎨', title: '3D Visualization', desc: 'Interactive 3D interface' },
              { icon: '📊', title: 'Smart Export', desc: 'Excel, PDF, DOCX format' },
            ].map((feature, idx) => (
              <div
                key={idx}
                style={{
                  padding: 16,
                  backgroundColor: 'rgba(26, 66, 139, 0.1)',
                  border: '1px solid rgba(26, 66, 139, 0.2)',
                  borderRadius: 8,
                  transition: 'all 0.3s ease',
                  transform: showContent ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                  opacity: showContent ? 1 : 0,
                  animation: `fadeInUp 0.8s ease-out ${0.5 + idx * 0.1}s both`,
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>{feature.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#1a428b' }}>
                  {feature.title}
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{feature.desc}</div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            type="primary"
            size="large"
            onClick={onEnter}
            style={{
              pointerEvents: 'auto',
              fontSize: 16,
              height: 48,
              paddingLeft: 32,
              paddingRight: 32,
              background: 'linear-gradient(135deg, #1a428b 0%, #0d2557 100%)',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              animation: 'fadeInUp 0.8s ease-out 0.6s both, pulse 2s ease-in-out 2s infinite',
            }}
          >
            Mulai Sekarang <ArrowRight size={18} />
          </Button>
        </div>
      </div>

      {/* Parallax scroll hint */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: 12,
          zIndex: 10,
          animation: 'fadeInUp 0.8s ease-out 0.8s both',
        }}
      >
        <div style={{ marginBottom: 8 }}>Geser mouse untuk interaksi 3D</div>
        <div style={{ fontSize: 20, animation: 'bounce 2s ease-in-out infinite' }}>↓</div>
      </div>

      {/* Global animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
