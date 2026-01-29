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
    const sizes = new Float32Array(STAR_COUNT);
    const colors = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      positions[i * 3] = (Math.random() * 2 - 1) * 50;
      positions[i * 3 + 1] = (Math.random() * 2 - 1) * 50;
      positions[i * 3 + 2] = (Math.random() * 2 - 1) * 50;
      sizes[i] = 0.2 + Math.random() * 0.3;
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 1;
      colors[i * 3 + 2] = 1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uScale: { value: 40 },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float uScale;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uScale;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          if (dot(c, c) > 0.25) discard;
          gl_FragColor = vec4(vColor, 0.8);
        }
      `,
      transparent: true,
      depthWrite: true,
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
