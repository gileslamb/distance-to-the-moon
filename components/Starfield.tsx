"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const STAR_COUNT = 7000;
const ROTATION_SPEED = { frantic: 0.02, relaxed: 0.002, otherworldly: 0.001 } as const;
type Mood = "relaxed" | "frantic" | "otherworldly";

interface StarfieldProps {
  mood?: Mood;
  sizeMultiplier?: number;
  speedMultiplier?: number;
  sensitivity?: number;
  className?: string;
}

export default function Starfield({
  mood = "relaxed",
  sizeMultiplier = 1,
  speedMultiplier = 1,
  sensitivity = 0.33,
  className = "",
}: StarfieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const rotationSpeedRef = useRef(ROTATION_SPEED[mood]);
  const speedMultiplierRef = useRef(speedMultiplier);
  speedMultiplierRef.current = speedMultiplier;
  const sensitivityRef = useRef(sensitivity);
  sensitivityRef.current = sensitivity;
  const baseRotationXRef = useRef(0);
  const baseRotationYRef = useRef(0);
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const mouseCurrentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    rotationSpeedRef.current = ROTATION_SPEED[mood ?? "relaxed"];
  }, [mood]);

  useEffect(() => {
    const mat = materialRef.current;
    if (mat?.uniforms?.uSizeMultiplier) mat.uniforms.uSizeMultiplier.value = sizeMultiplier;
  }, [sizeMultiplier]);

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
        uSizeMultiplier: { value: sizeMultiplier },
        uMouseOffset: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float uScale;
        uniform float uSizeMultiplier;
        uniform vec2 uMouseOffset;
        void main() {
          vColor = color;
          float depthMult = 1.0 + position.z * 0.02;
          vec3 offsetPos = position + vec3(uMouseOffset.x * depthMult * 2.0, uMouseOffset.y * depthMult * 2.0, 0.0);
          vec4 mvPosition = modelViewMatrix * vec4(offsetPos, 1.0);
          gl_PointSize = size * uScale * uSizeMultiplier;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          if (dot(c, c) > 0.25) discard;
          gl_FragColor = vec4(vColor, 0.5);
        }
      `,
      transparent: true,
      depthWrite: true,
    });

    materialRef.current = material;
    const points = new THREE.Points(geometry, material);
    pointsRef.current = points;
    scene.add(points);

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseTargetRef.current = { x, y: -y };
    };

    window.addEventListener("mousemove", handleMouseMove);

    function animate() {
      requestAnimationFrame(animate);

      const pts = pointsRef.current;
      if (!pts) return;

      const sens = sensitivityRef.current;
      // effectStrength: 0.33 = original subtle (0), 1.0 = current powerful (1), 2.0 = max (~2.5)
      const effectStrength = Math.max(0, (sens - 0.33) / 0.67);
      const lerp = 0.05 + effectStrength * 0.15;
      const influence = 0.05 + effectStrength * 0.1;
      const parallaxScale = effectStrength * 35;

      const { x: tx, y: ty } = mouseTargetRef.current;
      const cur = mouseCurrentRef.current;
      cur.x += (tx - cur.x) * lerp;
      cur.y += (ty - cur.y) * lerp;

      const speed = rotationSpeedRef.current;
      const mult = speedMultiplierRef.current;
      baseRotationXRef.current += speed * 0.3 * mult;
      baseRotationYRef.current += speed * mult;

      pts.rotation.x = baseRotationXRef.current + cur.y * influence;
      pts.rotation.y = baseRotationYRef.current + cur.x * influence;

      const mat = materialRef.current;
      if (mat?.uniforms?.uMouseOffset) {
        mat.uniforms.uMouseOffset.value.set(cur.x * parallaxScale, cur.y * parallaxScale);
      }

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
      window.removeEventListener("mousemove", handleMouseMove);
      materialRef.current = null;
      pointsRef.current = null;
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className={className} style={{ width: "100%", height: "100%" }} />;
}
