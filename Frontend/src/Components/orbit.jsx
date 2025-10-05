import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import useAsteroidStore from "../other/useAsteroidStore";

export default function OrbitSimulation() {

  const { xdistance, ydistance, zdistance, launched2,size } = useAsteroidStore();
  const mountRef = useRef(null);
  const [impactTime, setImpactTime] = useState('—');
  const [impactLoc, setImpactLoc] = useState('—');

  const initPos = [Number(xdistance), Number(ydistance), Number(zdistance)];
  const initVel = [0, 1000, 0];

  useEffect(() => {

   
    console.log("Starting simulation with:", initPos);

    // Constants
    const G = 6.674e-11;
    const dt = 100;
    const massEarth = 5.972e24;
    const radEarth = 6.378;
    const radAst = size;
    const scaleFactor = 1e6;

    let posAst = [...initPos];
    let velAst = [...initVel];
    let t = 0;
    let simulationRunning = true;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 30, 120);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Basic camera controls - calculate initial distance from actual camera position
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let cameraDistance = Math.sqrt(
      camera.position.x ** 2 + camera.position.y ** 2 + camera.position.z ** 2
    );

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      const rotationSpeed = 0.005;
      const phi = Math.atan2(camera.position.z, camera.position.x);
      const theta = Math.acos(camera.position.y / cameraDistance);

      const newPhi = phi - deltaX * rotationSpeed;
      const newTheta = Math.max(0.1, Math.min(Math.PI - 0.1, theta + deltaY * rotationSpeed));

      camera.position.x = cameraDistance * Math.sin(newTheta) * Math.cos(newPhi);
      camera.position.y = cameraDistance * Math.cos(newTheta);
      camera.position.z = cameraDistance * Math.sin(newTheta) * Math.sin(newPhi);
      camera.lookAt(0, 0, 0);

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      const zoomSpeed = 0.1;
      cameraDistance += e.deltaY * zoomSpeed;


      const phi = Math.atan2(camera.position.z, camera.position.x);
      const theta = Math.acos(camera.position.y / Math.sqrt(
        camera.position.x ** 2 + camera.position.y ** 2 + camera.position.z ** 2
      ));

      camera.position.x = cameraDistance * Math.sin(theta) * Math.cos(phi);
      camera.position.y = cameraDistance * Math.cos(theta);
      camera.position.z = cameraDistance * Math.sin(theta) * Math.sin(phi);
      camera.lookAt(0, 0, 0);
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    // Earth
    const earthGeo = new THREE.SphereGeometry(radEarth, 64, 32);
    const earthMat = new THREE.MeshStandardMaterial({ color: 0x2233ff });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earth);

    // Light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(50, 100, 50);
    scene.add(light);

    // Asteroid
    const asteroidGeo = new THREE.SphereGeometry(radAst, 15, 7);
    const asteroidMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const asteroid = new THREE.Mesh(asteroidGeo, asteroidMat);
    scene.add(asteroid);

    // Trail
    const trailPoints = [];
    const trailMaterial = new THREE.LineBasicMaterial({ color: 0x4444ff });
    let trailGeometry = new THREE.BufferGeometry();
    const trailLine = new THREE.Line(trailGeometry, trailMaterial);
    scene.add(trailLine);

    function updateTrail(newPos) {
      trailPoints.push(new THREE.Vector3(...newPos));
      if (trailPoints.length > 500) trailPoints.shift();

      // Dispose old geometry and create new one
      trailGeometry.dispose();
      trailGeometry = new THREE.BufferGeometry();
      trailGeometry.setFromPoints(trailPoints);
      trailLine.geometry = trailGeometry;
    }
  

    // Stars
    function createStars(numStars = 10000) {
      const starGeometry = new THREE.BufferGeometry();
      const starVertices = [];

      for (let i = 0; i < numStars; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starVertices.push(x, y, z);
      }

      starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

      const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1,
      });

      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);
    }

    function acceleration(pos) {
      const posMeters = pos.map(p => p * scaleFactor);
      const r = Math.sqrt(posMeters[0] ** 2 + posMeters[1] ** 2 + posMeters[2] ** 2);
      const factor = -G * massEarth / (r ** 3);
      return posMeters.map(x => factor * x);
    }

    function rk4(pos, vel) {
      const a1 = acceleration(pos);
      const k1_r = vel.map(v => v * dt);
      const k1_v = a1.map(a => a * dt);

      const a2 = acceleration(pos.map((p, i) => p + 0.5 * k1_r[i] / scaleFactor));
      const k2_r = vel.map((v, i) => (v + 0.5 * k1_v[i]) * dt);
      const k2_v = a2.map(a => a * dt);

      const a3 = acceleration(pos.map((p, i) => p + 0.5 * k2_r[i] / scaleFactor));
      const k3_r = vel.map((v, i) => (v + 0.5 * k2_v[i]) * dt);
      const k3_v = a3.map(a => a * dt);

      const a4 = acceleration(pos.map((p, i) => p + k3_r[i] / scaleFactor));
      const k4_r = vel.map((v, i) => (v + k3_v[i]) * dt);
      const k4_v = a4.map(a => a * dt);

      const newPos = pos.map((p, i) => p + (k1_r[i] + 2 * k2_r[i] + 2 * k3_r[i] + k4_r[i]) / (6 * scaleFactor));
      const newVel = vel.map((v, i) => v + (k1_v[i] + 2 * k2_v[i] + 2 * k3_v[i] + k4_v[i]) / 6);

      return [newPos, newVel];
    }

    createStars();

    let animationFrameId;

    function animate() {
      animationFrameId = requestAnimationFrame(animate);

      if (simulationRunning) {
        [posAst, velAst] = rk4(posAst, velAst);
        asteroid.position.set(...posAst);
        updateTrail(posAst);

        const dist = Math.sqrt(posAst[0] ** 2 + posAst[1] ** 2 + posAst[2] ** 2);
        if (dist <= radEarth + radAst) {
          setImpactTime(t.toFixed(2));

          const norm = radEarth / dist;
          const impactPoint = posAst.map(p => p * norm);

          const lat = Math.asin(impactPoint[2] / radEarth) * 180 / Math.PI;
          const lon = Math.atan2(impactPoint[1], impactPoint[0]) * 180 / Math.PI;
          setImpactLoc(`${lat.toFixed(2)}°, ${lon.toFixed(2)}°`);

          asteroid.visible = false;
          simulationRunning = false;
        } else {
          t += dt;
        }
      }

      renderer.render(scene, camera);
    }

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      
      
      
    };
  }, [launched2]);

  return (
    <div className="relative w-full h-screen">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded font-mono text-sm">
        <div className="mb-2">
          <strong>Initial Position:</strong> {initPos.map(p => p.toFixed(2)).join(', ')}
        </div>
        <div className="mb-2">
          <strong>Initial Velocity:</strong> {initVel.map(p => p.toFixed(2)).join(', ')} m/s
        </div>
        <div className="mb-2">
          <strong>Impact Time:</strong> <span id="impactTime">{impactTime}</span> s
        </div>
        <div>
          <strong>Impact Location:</strong> <span id="impactLoc">{impactLoc}</span>
        </div>
      </div>
    </div>
  );
}