"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const STAR_COUNT = 7000;
const ROTATION_SPEED = { frantic: 0.02, relaxed: 0.002, otherworldly: 0.001 } as const;
type Mood = "relaxed" | "frantic" | "otherworldly";

interface StarfieldProps {
  mood?: Mood;
  className?: string;
}

export default function Starfield({ mood = "relaxed", className = "" }: StarfieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const positions = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT * 3; i += 3) {
      positions[i] = (Math.random() * 2 - 1) * 50;
      positions[i + 1] = (Math.random() * 2 - 1) * 50;
      positions[i + 2] = (Math.random() * 2 - 1) * 50;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.2,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const speed = ROTATION_SPEED[mood ?? "relaxed"];

    function animate() {
      requestAnimationFrame(animate);
      points.rotation.y += speed;
      points.rotation.x += speed * 0.3;
      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [mood]);

  return <div ref={containerRef} className={className} style={{ width: "100%", height: "100%" }} />;
}
