import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * InteractiveRoadCanvas - 3D "Car on a Road" dynamic interactive background
 * Powered by Three.js
 *
 * Features:
 * - Dynamic highway with animated moving dashed road markings & roadside beacons
 * - Correct vehicle orientation: Truck faces down the highway driving FORWARD into the horizon
 * - Visible taillights on the rear (facing camera) and forward headlights projecting down the road
 * - Light Mode: Animated sun with luminous corona, drifting procedural clouds, and cursor parallax
 * - Dark Mode: Glowing crescent moon with celestial atmospheric halo, twinkling starfield, and cursor parallax
 * - Interactive cursor steering, body banking, and camera parallax
 */
export default function InteractiveRoadCanvas({ theme = 'dark' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- SCENE & CAMERA SETUP ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.1,
      600
    );
    // Camera positioned behind and slightly above the truck, looking forward down the highway
    camera.position.set(0, 3.6, 9.5);

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
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    const isDark = theme === 'dark';

    // --- FOG & ATMOSPHERE ---
    const fogColor = isDark ? 0x050814 : 0xbae6fd;
    scene.fog = new THREE.FogExp2(fogColor, isDark ? 0.011 : 0.0075);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(
      isDark ? 0x475569 : 0xffffff,
      isDark ? 1.6 : 1.4
    );
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(
      isDark ? 0xa5f3fc : 0xfffaed,
      isDark ? 1.8 : 2.2
    );
    mainLight.position.set(20, 45, 20);
    scene.add(mainLight);

    // Dedicated key light focusing on the vehicle rear & roof
    const vehicleLight = new THREE.DirectionalLight(
      isDark ? 0xffffff : 0xffffff,
      isDark ? 1.6 : 1.0
    );
    vehicleLight.position.set(-10, 25, 25);
    scene.add(vehicleLight);

    // --- DYNAMIC SKY ELEMENTS (SUN / MOON / CLOUDS / STARS) ---
    const skyGroup = new THREE.Group();
    scene.add(skyGroup);

    let sunMesh = null;
    let sunCorona = null;
    let moonGroup = null;
    let starsMesh = null;
    let clouds = [];

    if (isDark) {
      // 1. Glowing Celestial Moon
      moonGroup = new THREE.Group();
      moonGroup.position.set(-28, 35, -190);

      // Moon body
      const moonGeo = new THREE.SphereGeometry(12, 32, 32);
      const moonMat = new THREE.MeshBasicMaterial({
        color: 0xf1f5f9,
      });
      const moon = new THREE.Mesh(moonGeo, moonMat);
      moonGroup.add(moon);

      // Luminous celestial atmospheric halo
      const moonHaloGeo = new THREE.CircleGeometry(26, 32);
      const moonHaloMat = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
      });
      const moonHalo = new THREE.Mesh(moonHaloGeo, moonHaloMat);
      moonHalo.position.z = -1;
      moonGroup.add(moonHalo);

      const moonOuterHaloGeo = new THREE.CircleGeometry(42, 32);
      const moonOuterHaloMat = new THREE.MeshBasicMaterial({
        color: 0xa855f7,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
      });
      const moonOuterHalo = new THREE.Mesh(moonOuterHaloGeo, moonOuterHaloMat);
      moonOuterHalo.position.z = -2;
      moonGroup.add(moonOuterHalo);

      skyGroup.add(moonGroup);

      // 2. Twinkling Cosmic Stars
      const starCount = 700;
      const starGeometry = new THREE.BufferGeometry();
      const starPositions = new Float32Array(starCount * 3);
      const starColors = new Float32Array(starCount * 3);

      for (let i = 0; i < starCount; i++) {
        const x = (Math.random() - 0.5) * 450;
        const y = Math.random() * 160 + 5;
        const z = -Math.random() * 320;
        starPositions[i * 3] = x;
        starPositions[i * 3 + 1] = y;
        starPositions[i * 3 + 2] = z;

        const pick = Math.random();
        if (pick > 0.7) {
          starColors[i * 3] = 0.0;
          starColors[i * 3 + 1] = 0.95;
          starColors[i * 3 + 2] = 1.0;
        } else if (pick > 0.4) {
          starColors[i * 3] = 0.9;
          starColors[i * 3 + 1] = 0.3;
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
        size: 1.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.88,
      });
      starsMesh = new THREE.Points(starGeometry, starMaterial);
      skyGroup.add(starsMesh);
    } else {
      // 1. Radiant Animated Sun
      const sunGroup = new THREE.Group();
      sunGroup.position.set(28, 36, -190);

      const sunGeo = new THREE.SphereGeometry(14, 32, 32);
      const sunMat = new THREE.MeshBasicMaterial({
        color: 0xfffbeb,
      });
      sunMesh = new THREE.Mesh(sunGeo, sunMat);
      sunGroup.add(sunMesh);

      // Sun golden corona rays
      const coronaGeo = new THREE.CircleGeometry(32, 32);
      const coronaMat = new THREE.MeshBasicMaterial({
        color: 0xfde047,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      });
      sunCorona = new THREE.Mesh(coronaGeo, coronaMat);
      sunCorona.position.z = -1;
      sunGroup.add(sunCorona);

      const outerCoronaGeo = new THREE.CircleGeometry(52, 32);
      const outerCoronaMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
      });
      const outerCorona = new THREE.Mesh(outerCoronaGeo, outerCoronaMat);
      outerCorona.position.z = -2;
      sunGroup.add(outerCorona);

      skyGroup.add(sunGroup);

      // 2. Procedural Drifting Clouds
      const cloudGeo = new THREE.SphereGeometry(14, 12, 12);
      const cloudMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.45,
      });

      for (let i = 0; i < 18; i++) {
        const cloudPuff = new THREE.Mesh(cloudGeo, cloudMat);
        cloudPuff.position.set(
          (Math.random() - 0.5) * 350,
          Math.random() * 45 + 18,
          -Math.random() * 260 - 40
        );
        cloudPuff.scale.set(1.8, 0.45, 1.1);
        cloudPuff.userData = {
          speed: Math.random() * 3 + 2,
        };
        skyGroup.add(cloudPuff);
        clouds.push(cloudPuff);
      }
    }

    // --- THE HIGHWAY (STRETCHING FORWARD DOWN -Z) ---
    const roadWidth = 18;
    const roadLength = 320;
    const roadGeo = new THREE.PlaneGeometry(roadWidth, roadLength, 1, 1);
    const roadMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x090d1a : 0x334155,
      roughness: 0.65,
      metalness: 0.25,
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, -roadLength / 2 + 10);
    scene.add(road);

    // Roadside shoulder lines
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

    // Dashed Lane Stripes (Moving towards camera along +Z to simulate forward driving into -Z)
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

    // Roadside Beacons
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

    // --- FLEETOPS CYBER-TRUCK MODEL (PROPERLY ORIENTED FORWARD DOWN ROAD) ---
    // The truck is oriented facing -Z (down the road into the distance).
    // The camera is at +Z looking at the REAR and ROOF of the truck driving forward!
    const carGroup = new THREE.Group();

    // 1. Truck Main Chassis
    const chassisGeo = new THREE.BoxGeometry(2.3, 0.65, 5.0);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x94a3b8 : 0x1e293b,
      metalness: 0.75,
      roughness: 0.2,
    });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 0.55;
    carGroup.add(chassis);

    // 2. Cargo Container (Nearer to the rear, facing +Z towards camera)
    const cargoGeo = new THREE.BoxGeometry(2.2, 1.6, 3.2);
    const cargoMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0xe2e8f0 : 0x0284c7,
      metalness: 0.4,
      roughness: 0.25,
    });
    const cargo = new THREE.Mesh(cargoGeo, cargoMat);
    cargo.position.set(0, 1.6, 0.6); // Located at positive Z (closer to camera)
    carGroup.add(cargo);

    // Cyber livery bands on cargo
    const decalGeo = new THREE.PlaneGeometry(2.22, 0.22);
    const decalMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x00f3ff : 0xffffff,
      transparent: true,
      opacity: 1.0,
    });
    const sideDecalL = new THREE.Mesh(decalGeo, decalMat);
    sideDecalL.rotation.y = -Math.PI / 2;
    sideDecalL.position.set(-1.11, 1.8, 0.6);
    carGroup.add(sideDecalL);

    const sideDecalR = new THREE.Mesh(decalGeo, decalMat);
    sideDecalR.rotation.y = Math.PI / 2;
    sideDecalR.position.set(1.11, 1.8, 0.6);
    carGroup.add(sideDecalR);

    // Rear Cargo Doors (Directly facing the user camera at +Z!)
    const rearCargoDoorGeo = new THREE.PlaneGeometry(1.9, 1.3);
    const rearCargoMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0xcbd5e1 : 0x0369a1,
      metalness: 0.5,
      roughness: 0.3,
    });
    const rearCargoDoor = new THREE.Mesh(rearCargoDoorGeo, rearCargoMat);
    rearCargoDoor.position.set(0, 1.6, 2.21);
    carGroup.add(rearCargoDoor);

    // 3. Driver Cabin (Forward at -Z, facing down the road!)
    const cabinGeo = new THREE.BoxGeometry(2.1, 1.25, 1.5);
    const cabinMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0xcfd8dc : 0x0f172a,
      metalness: 0.6,
      roughness: 0.25,
    });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.45, -1.6); // Front of vehicle facing -Z down highway
    carGroup.add(cabin);

    // 4. Windshield & Windows (Slanted forward at -Z)
    const windshieldGeo = new THREE.PlaneGeometry(1.8, 0.8);
    const glassMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x00f3ff : 0x38bdf8,
      metalness: 0.9,
      roughness: 0.05,
      transparent: true,
      opacity: 0.85,
    });
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.rotation.x = 0.3; // Slanted towards front
    windshield.position.set(0, 1.65, -2.36);
    carGroup.add(windshield);

    // 5. Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.4, 20);
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      metalness: 0.5,
    });
    const rimMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x00f3ff : 0x0284c7,
    });

    const wheels = [];
    const wheelPositions = [
      [-1.15, 0.44, 1.5],  // Rear left
      [1.15, 0.44, 1.5],   // Rear right
      [-1.15, 0.44, -1.4], // Front left
      [1.15, 0.44, -1.4],  // Front right
    ];

    wheelPositions.forEach(([x, y, z]) => {
      const wheelHub = new THREE.Group();
      wheelHub.position.set(x, y, z);

      const tire = new THREE.Mesh(wheelGeo, wheelMat);
      tire.rotation.z = Math.PI / 2;
      wheelHub.add(tire);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.42, 12), rimMat);
      rim.rotation.z = Math.PI / 2;
      wheelHub.add(rim);

      carGroup.add(wheelHub);
      wheels.push(wheelHub);
    });

    // 6. Taillights (Facing +Z directly towards user camera!)
    const tailLightGeo = new THREE.BoxGeometry(0.65, 0.18, 0.1);
    const tailLightMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0xff007f : 0xe11d48,
    });

    const tailLeft = new THREE.Mesh(tailLightGeo, tailLightMat);
    tailLeft.position.set(-0.7, 0.75, 2.25);
    carGroup.add(tailLeft);

    const tailRight = new THREE.Mesh(tailLightGeo, tailLightMat);
    tailRight.position.set(0.7, 0.75, 2.25);
    carGroup.add(tailRight);

    // Taillight ground reflection in dark mode (behind vehicle towards camera)
    if (isDark) {
      const tailReflectionGeo = new THREE.PlaneGeometry(3.8, 3.8);
      const tailReflectionMat = new THREE.MeshBasicMaterial({
        color: 0xff007f,
        transparent: true,
        opacity: 0.25,
      });
      const tailReflect = new THREE.Mesh(tailReflectionGeo, tailReflectionMat);
      tailReflect.rotation.x = -Math.PI / 2;
      tailReflect.position.set(0, 0.04, 3.2);
      carGroup.add(tailReflect);

      // Cyan Underglow underneath chassis
      const underglowGeo = new THREE.PlaneGeometry(3.0, 5.2);
      const underglowMat = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.28,
      });
      const underglow = new THREE.Mesh(underglowGeo, underglowMat);
      underglow.rotation.x = -Math.PI / 2;
      underglow.position.set(0, 0.06, 0);
      carGroup.add(underglow);
    }

    // 7. Headlights (Facing -Z down the road into the distance!)
    const headLightGeo = new THREE.BoxGeometry(0.45, 0.18, 0.1);
    const headLightMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x00f3ff : 0xfef08a,
    });

    const headLeft = new THREE.Mesh(headLightGeo, headLightMat);
    headLeft.position.set(-0.75, 0.75, -2.45);
    carGroup.add(headLeft);

    const headRight = new THREE.Mesh(headLightGeo, headLightMat);
    headRight.position.set(0.75, 0.75, -2.45);
    carGroup.add(headRight);

    // Forward-Projecting Volumetric Headlight Beams (Projecting down the road into -Z!)
    if (isDark) {
      const beamGeo = new THREE.ConeGeometry(3.8, 34, 24, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide,
      });

      // Left beam pointing down -Z
      const leftBeam = new THREE.Mesh(beamGeo, beamMat);
      leftBeam.rotation.x = -Math.PI / 2; // Pointing forward into -Z!
      leftBeam.position.set(-0.75, 0.75, -19.5);
      carGroup.add(leftBeam);

      // Right beam pointing down -Z
      const rightBeam = new THREE.Mesh(beamGeo, beamMat);
      rightBeam.rotation.x = -Math.PI / 2; // Pointing forward into -Z!
      rightBeam.position.set(0.75, 0.75, -19.5);
      carGroup.add(rightBeam);

      // Illuminated light pool on the road in front
      const lightPoolGeo = new THREE.CircleGeometry(7.0, 32);
      const lightPoolMat = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.22,
      });
      const lightPool = new THREE.Mesh(lightPoolGeo, lightPoolMat);
      lightPool.rotation.x = -Math.PI / 2;
      lightPool.position.set(0, 0.05, -24);
      carGroup.add(lightPool);
    }

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
    const highwaySpeed = 38.0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth cursor lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      // 1. Move dashed lane stripes towards camera along +Z to simulate forward speed into -Z
      const moveDistance = highwaySpeed * delta;

      for (let i = 0; i < stripeCount; i++) {
        leftStripes[i].position.z += moveDistance;
        rightStripes[i].position.z += moveDistance;

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

      // 3. Rotate wheels (rolling forward down highway)
      wheels.forEach((w) => {
        w.children[0].rotation.x += moveDistance * 1.8;
      });

      // 4. Interactive Car Lane Position & Banking
      const targetLaneX = mouse.x * 5.6;
      const prevCarX = carGroup.position.x;
      carGroup.position.x += (targetLaneX - carGroup.position.x) * 0.07;
      const velocityX = carGroup.position.x - prevCarX;

      // Realistic Banking & Steering into turns
      carGroup.rotation.z = -velocityX * 0.55; // Body roll into turn
      carGroup.rotation.y = -velocityX * 0.35; // Steering yaw

      // Subtle suspension road vibration
      carGroup.position.y = Math.sin(elapsed * 16) * 0.025;

      // 5. Dynamic Sky Element Parallax & Animation
      if (isDark) {
        // Moon parallax
        if (moonGroup) {
          moonGroup.position.x = -28 - mouse.x * 12;
          moonGroup.position.y = 35 + mouse.y * 6;
        }
        // Twinkling stars drift
        if (starsMesh) {
          starsMesh.rotation.y = elapsed * 0.006 + mouse.x * 0.02;
        }
      } else {
        // Sun corona breathing & parallax
        if (sunMesh && sunCorona) {
          sunCorona.scale.set(
            1 + Math.sin(elapsed * 2) * 0.05,
            1 + Math.sin(elapsed * 2) * 0.05,
            1
          );
          skyGroup.position.x = mouse.x * 10;
          skyGroup.position.y = mouse.y * 5;
        }
        // Drifting clouds
        clouds.forEach((cloud) => {
          cloud.position.x += cloud.userData.speed * delta;
          if (cloud.position.x > 180) {
            cloud.position.x = -180;
          }
        });
      }

      // 6. Camera Parallax
      camera.position.x = mouse.x * 1.5;
      camera.position.y = 3.6 + mouse.y * 0.35;
      camera.lookAt(carGroup.position.x * 0.45, 1.4, -35);

      renderer.render(scene, camera);
    };

    animate();

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
        backgroundColor: theme === 'dark' ? '#050814' : '#bae6fd',
        transition: 'background-color 0.5s ease',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            theme === 'dark'
              ? 'radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(5, 8, 20, 0.70) 100%)'
              : 'radial-gradient(ellipse at 50% 40%, transparent 50%, rgba(186, 230, 253, 0.55) 100%)',
        }}
      />
    </div>
  );
}
