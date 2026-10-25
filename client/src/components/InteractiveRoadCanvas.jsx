import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * InteractiveRoadCanvas - 3D "Car on a Road" dynamic interactive background
 * Powered by Three.js
 *
 * Features:
 * - Dynamic highway with animated moving dashed lane markings & speed markers
 * - Sleek futuristic FleetOps commercial cyber-delivery truck
 * - Interactive cursor reaction: lane switching, steering yaw, body banking, and camera parallax
 * - Dark Mode: Cosmic night sky with twinkling stars, glowing headlights casting volumetric road illumination, neon road markers, and red taillight reflection
 * - Light Mode: Vibrant daytime highway with sunny azure sky, atmospheric horizon haze, crisp road markings, and realistic sunlight
 */
export default function InteractiveRoadCanvas({ theme = 'dark' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- SCENE & RENDERER SETUP ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      600
    );
    // Camera positioned behind and slightly above the car looking forward
    camera.position.set(0, 3.8, 8.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    const isDark = theme === 'dark';

    // --- FOG & BACKGROUND ---
    const fogColor = isDark ? 0x050814 : 0xdbeafe;
    scene.fog = new THREE.FogExp2(fogColor, isDark ? 0.012 : 0.009);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(
      isDark ? 0x1e293b : 0xffffff,
      isDark ? 0.6 : 1.2
    );
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(
      isDark ? 0x38bdf8 : 0xfffaed,
      isDark ? 0.8 : 1.8
    );
    sunLight.position.set(20, 40, 20);
    scene.add(sunLight);

    // --- ENVIRONMENT: STARS & SKY ---
    let starsMesh = null;
    if (isDark) {
      const starCount = 650;
      const starGeometry = new THREE.BufferGeometry();
      const starPositions = new Float32Array(starCount * 3);
      const starColors = new Float32Array(starCount * 3);

      for (let i = 0; i < starCount; i++) {
        const x = (Math.random() - 0.5) * 400;
        const y = Math.random() * 150 + 5;
        const z = -Math.random() * 300;
        starPositions[i * 3] = x;
        starPositions[i * 3 + 1] = y;
        starPositions[i * 3 + 2] = z;

        // Cyan, purple, white star colors
        const pick = Math.random();
        if (pick > 0.7) {
          starColors[i * 3] = 0.0;
          starColors[i * 3 + 1] = 0.95;
          starColors[i * 3 + 2] = 1.0;
        } else if (pick > 0.4) {
          starColors[i * 3] = 0.9;
          starColors[i * 3 + 1] = 0.2;
          starColors[i * 3 + 2] = 0.9;
        } else {
          starColors[i * 3] = 1.0;
          starColors[i * 3 + 1] = 1.0;
          starColors[i * 3 + 2] = 1.0;
        }
      }

      starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

      const starMaterial = new THREE.PointsMaterial({
        size: 1.4,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
      });
      starsMesh = new THREE.Points(starGeometry, starMaterial);
      scene.add(starsMesh);
    } else {
      // Soft ambient clouds in daytime
      const cloudGeo = new THREE.SphereGeometry(12, 8, 8);
      const cloudMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35,
      });
      for (let i = 0; i < 15; i++) {
        const cloud = new THREE.Mesh(cloudGeo, cloudMat);
        cloud.position.set(
          (Math.random() - 0.5) * 300,
          Math.random() * 40 + 20,
          -Math.random() * 250 - 50
        );
        cloud.scale.set(1.5, 0.4, 0.9);
        scene.add(cloud);
      }
    }

    // --- HORIZON GLOW (Sun / Cyber-Moon) ---
    const horizonGlowGeo = new THREE.CircleGeometry(26, 32);
    const horizonGlowMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x00f3ff : 0xfde047,
      transparent: true,
      opacity: isDark ? 0.25 : 0.45,
      side: THREE.DoubleSide,
    });
    const horizonGlow = new THREE.Mesh(horizonGlowGeo, horizonGlowMat);
    horizonGlow.position.set(0, 4, -220);
    scene.add(horizonGlow);

    // --- THE ROAD ---
    const roadWidth = 18;
    const roadLength = 320;
    const roadGeo = new THREE.PlaneGeometry(roadWidth, roadLength, 1, 1);
    const roadMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x090d1a : 0x334155,
      roughness: 0.65,
      metalness: 0.2,
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, -roadLength / 2 + 10);
    scene.add(road);

    // Roadside shoulder glow lines (Outer boundaries)
    const shoulderGeo = new THREE.PlaneGeometry(0.35, roadLength);
    const shoulderMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x00f3ff : 0x0284c7,
      transparent: true,
      opacity: isDark ? 0.75 : 0.85,
    });

    const leftShoulder = new THREE.Mesh(shoulderGeo, shoulderMat);
    leftShoulder.rotation.x = -Math.PI / 2;
    leftShoulder.position.set(-roadWidth / 2 + 0.3, 0.02, -roadLength / 2 + 10);
    scene.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(shoulderGeo, shoulderMat);
    rightShoulder.rotation.x = -Math.PI / 2;
    rightShoulder.position.set(roadWidth / 2 - 0.3, 0.02, -roadLength / 2 + 10);
    scene.add(rightShoulder);

    // Moving Dashed Lane Stripes (Left lane divider & Right lane divider)
    const stripeCount = 28;
    const stripeSpacing = roadLength / stripeCount;
    const stripeGeo = new THREE.PlaneGeometry(0.28, 4.2);
    const stripeMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x00ff88 : 0xffffff,
      transparent: true,
      opacity: isDark ? 0.85 : 0.9,
    });

    const leftStripes = [];
    const rightStripes = [];

    for (let i = 0; i < stripeCount; i++) {
      const zPos = -i * stripeSpacing + 10;

      const sLeft = new THREE.Mesh(stripeGeo, stripeMat);
      sLeft.rotation.x = -Math.PI / 2;
      sLeft.position.set(-roadWidth / 6, 0.03, zPos);
      scene.add(sLeft);
      leftStripes.push(sLeft);

      const sRight = new THREE.Mesh(stripeGeo, stripeMat);
      sRight.rotation.x = -Math.PI / 2;
      sRight.position.set(roadWidth / 6, 0.03, zPos);
      scene.add(sRight);
      rightStripes.push(sRight);
    }

    // Roadside Light Beacons (Pillars passing by)
    const beaconCount = 18;
    const beaconSpacing = roadLength / beaconCount;
    const beaconGeo = new THREE.BoxGeometry(0.25, 2.5, 0.25);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0xa855f7 : 0x0284c7,
      transparent: true,
      opacity: isDark ? 0.6 : 0.45,
    });
    const leftBeacons = [];
    const rightBeacons = [];

    for (let i = 0; i < beaconCount; i++) {
      const z = -i * beaconSpacing + 10;
      const bLeft = new THREE.Mesh(beaconGeo, beaconMat);
      bLeft.position.set(-roadWidth / 2 - 0.8, 1.25, z);
      scene.add(bLeft);
      leftBeacons.push(bLeft);

      const bRight = new THREE.Mesh(beaconGeo, beaconMat);
      bRight.position.set(roadWidth / 2 + 0.8, 1.25, z);
      scene.add(bRight);
      rightBeacons.push(bRight);
    }

    // --- FLEETOPS CYBER-TRUCK MODEL ---
    const carGroup = new THREE.Group();

    // 1. Truck Main Chassis (Lower Cab & Floor)
    const chassisGeo = new THREE.BoxGeometry(2.3, 0.65, 5.0);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x0f172a : 0x1e293b,
      metalness: 0.8,
      roughness: 0.25,
    });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 0.55;
    carGroup.add(chassis);

    // 2. Cargo Container (Commercial Delivery Box)
    const cargoGeo = new THREE.BoxGeometry(2.2, 1.6, 3.2);
    const cargoMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x111c38 : 0x0284c7,
      metalness: 0.5,
      roughness: 0.35,
    });
    const cargo = new THREE.Mesh(cargoGeo, cargoMat);
    cargo.position.set(0, 1.6, -0.6);
    carGroup.add(cargo);

    // Cyber decal lines on cargo
    const decalGeo = new THREE.PlaneGeometry(2.22, 0.12);
    const decalMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x00f3ff : 0xffffff,
      transparent: true,
      opacity: 0.9,
    });
    const sideDecalL = new THREE.Mesh(decalGeo, decalMat);
    sideDecalL.rotation.y = -Math.PI / 2;
    sideDecalL.position.set(-1.11, 1.8, -0.6);
    carGroup.add(sideDecalL);

    const sideDecalR = new THREE.Mesh(decalGeo, decalMat);
    sideDecalR.rotation.y = Math.PI / 2;
    sideDecalR.position.set(1.11, 1.8, -0.6);
    carGroup.add(sideDecalR);

    // 3. Driver Cabin
    const cabinGeo = new THREE.BoxGeometry(2.1, 1.25, 1.5);
    const cabinMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x0b1120 : 0x0f172a,
      metalness: 0.7,
      roughness: 0.3,
    });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.45, 1.6);
    carGroup.add(cabin);

    // 4. Windshield & Windows
    const windshieldGeo = new THREE.PlaneGeometry(1.8, 0.8);
    const glassMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x00f3ff : 0x38bdf8,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.75,
    });
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.rotation.x = -0.3;
    windshield.position.set(0, 1.65, 2.36);
    carGroup.add(windshield);

    // Rear Window on Cargo
    const rearCargoDoorGeo = new THREE.PlaneGeometry(1.9, 1.3);
    const rearCargoMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x090e1f : 0x0369a1,
      metalness: 0.6,
      roughness: 0.4,
    });
    const rearCargoDoor = new THREE.Mesh(rearCargoDoorGeo, rearCargoMat);
    rearCargoDoor.position.set(0, 1.6, -2.21);
    rearCargoDoor.rotation.y = Math.PI;
    carGroup.add(rearCargoDoor);

    // 5. Wheels (4 Commercial Wheels with Rim Glow)
    const wheelGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.4, 20);
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.4,
    });
    const rimMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x00f3ff : 0x0284c7,
    });

    const wheels = [];
    const wheelPositions = [
      [-1.15, 0.44, 1.4],
      [1.15, 0.44, 1.4],
      [-1.15, 0.44, -1.5],
      [1.15, 0.44, -1.5],
    ];

    wheelPositions.forEach(([x, y, z]) => {
      const wheelHub = new THREE.Group();
      wheelHub.position.set(x, y, z);

      const tire = new THREE.Mesh(wheelGeo, wheelMat);
      tire.rotation.z = Math.PI / 2;
      wheelHub.add(tire);

      // Glowing Rim Center
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.42, 12), rimMat);
      rim.rotation.z = Math.PI / 2;
      wheelHub.add(rim);

      carGroup.add(wheelHub);
      wheels.push(wheelHub);
    });

    // 6. Taillights (Red / Neon Magenta Strip across the back)
    const tailLightGeo = new THREE.BoxGeometry(0.65, 0.16, 0.1);
    const tailLightMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0xff007f : 0xe11d48,
    });

    const tailLeft = new THREE.Mesh(tailLightGeo, tailLightMat);
    tailLeft.position.set(-0.7, 0.75, -2.25);
    carGroup.add(tailLeft);

    const tailRight = new THREE.Mesh(tailLightGeo, tailLightMat);
    tailRight.position.set(0.7, 0.75, -2.25);
    carGroup.add(tailRight);

    // Taillight ground reflection in dark mode
    if (isDark) {
      const tailReflectionGeo = new THREE.PlaneGeometry(3.5, 3.5);
      const tailReflectionMat = new THREE.MeshBasicMaterial({
        color: 0xff007f,
        transparent: true,
        opacity: 0.22,
      });
      const tailReflect = new THREE.Mesh(tailReflectionGeo, tailReflectionMat);
      tailReflect.rotation.x = -Math.PI / 2;
      tailReflect.position.set(0, 0.04, -3.2);
      carGroup.add(tailReflect);
    }

    // 7. Headlights & Volumetric Light Beams (Projecting forward on the road)
    const headLightGeo = new THREE.BoxGeometry(0.45, 0.18, 0.1);
    const headLightMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x00f3ff : 0xfef08a,
    });

    const headLeft = new THREE.Mesh(headLightGeo, headLightMat);
    headLeft.position.set(-0.75, 0.75, 2.45);
    carGroup.add(headLeft);

    const headRight = new THREE.Mesh(headLightGeo, headLightMat);
    headRight.position.set(0.75, 0.75, 2.45);
    carGroup.add(headRight);

    // Volumetric forward-projecting light cones in Dark mode
    if (isDark) {
      const beamGeo = new THREE.ConeGeometry(3.5, 30, 24, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.14,
        side: THREE.DoubleSide,
      });

      const leftBeam = new THREE.Mesh(beamGeo, beamMat);
      leftBeam.rotation.x = Math.PI / 2;
      leftBeam.position.set(-0.75, 0.75, 17.5);
      carGroup.add(leftBeam);

      const rightBeam = new THREE.Mesh(beamGeo, beamMat);
      rightBeam.rotation.x = Math.PI / 2;
      rightBeam.position.set(0.75, 0.75, 17.5);
      carGroup.add(rightBeam);

      // Light pool on the road in front
      const lightPoolGeo = new THREE.CircleGeometry(6, 32);
      const lightPoolMat = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.18,
      });
      const lightPool = new THREE.Mesh(lightPoolGeo, lightPoolMat);
      lightPool.rotation.x = -Math.PI / 2;
      lightPool.position.set(0, 0.05, 20);
      carGroup.add(lightPool);
    }

    // Position car in initial driving position
    carGroup.position.set(0, 0, 0);
    scene.add(carGroup);

    // --- CURSOR TRACKING STATE ---
    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    };

    const handleMouseMove = (e) => {
      // Normalize cursor coordinates from -1 to 1
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // --- ANIMATION LOOP ---
    let animationFrameId;
    let clock = new THREE.Clock();
    const highwaySpeed = 38.0; // Simulated km/h highway flow

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth cursor lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      // 1. Move dashed lane markings towards camera to simulate speed
      const moveDistance = highwaySpeed * delta;

      for (let i = 0; i < stripeCount; i++) {
        leftStripes[i].position.z += moveDistance;
        rightStripes[i].position.z += moveDistance;

        // Wrap around when passing behind camera
        if (leftStripes[i].position.z > 14) {
          leftStripes[i].position.z -= roadLength;
        }
        if (rightStripes[i].position.z > 14) {
          rightStripes[i].position.z -= roadLength;
        }
      }

      // 2. Move roadside beacons
      for (let i = 0; i < beaconCount; i++) {
        leftBeacons[i].position.z += moveDistance;
        rightBeacons[i].position.z += moveDistance;

        if (leftBeacons[i].position.z > 14) {
          leftBeacons[i].position.z -= roadLength;
        }
        if (rightBeacons[i].position.z > 14) {
          rightBeacons[i].position.z -= roadLength;
        }
      }

      // 3. Rotate wheels
      wheels.forEach((w) => {
        w.children[0].rotation.x -= moveDistance * 1.8;
      });

      // 4. Interactive Car Lane Position & Parallax Reaction
      // Target lane X bounded between [-5.5, 5.5]
      const targetLaneX = mouse.x * 5.6;
      const prevCarX = carGroup.position.x;
      carGroup.position.x += (targetLaneX - carGroup.position.x) * 0.07;
      const velocityX = carGroup.position.x - prevCarX;

      // Dynamic Banking & Steering Angle
      carGroup.rotation.z = -velocityX * 0.55; // Body roll into turn
      carGroup.rotation.y = -velocityX * 0.35; // Steering yaw towards lane

      // Subtle suspension road vibration
      carGroup.position.y = Math.sin(elapsed * 16) * 0.025;

      // Camera Parallax Reaction
      camera.position.x = mouse.x * 1.5;
      camera.position.y = 3.6 + mouse.y * 0.4;
      camera.lookAt(carGroup.position.x * 0.45, 1.4, -35);

      // Starfield subtle rotation/drift
      if (starsMesh) {
        starsMesh.rotation.y = elapsed * 0.008;
      }

      renderer.render(scene, camera);
    };

    animate();

    // --- CLEANUP ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [theme]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      style={{
        backgroundColor: theme === 'dark' ? '#050814' : '#e0f2fe',
        transition: 'background-color 0.5s ease',
      }}
    >
      {/* Subtle cyber grid vignette mask overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            theme === 'dark'
              ? 'radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(5, 8, 20, 0.75) 100%)'
              : 'radial-gradient(ellipse at 50% 40%, transparent 50%, rgba(224, 242, 254, 0.65) 100%)',
        }}
      />
    </div>
  );
}
