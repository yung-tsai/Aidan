import { useState, useEffect } from "react";

const AsciiCube = () => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 360);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  const size = 6;
  const A = (frame * Math.PI) / 180;
  const B = (frame * 0.7 * Math.PI) / 180;
  const C = (frame * 0.5 * Math.PI) / 180;

  const rotateX = (x: number, y: number, z: number) => {
    const cosA = Math.cos(A);
    const sinA = Math.sin(A);
    return { x, y: y * cosA - z * sinA, z: y * sinA + z * cosA };
  };

  const rotateY = (x: number, y: number, z: number) => {
    const cosB = Math.cos(B);
    const sinB = Math.sin(B);
    return { x: x * cosB + z * sinB, y, z: -x * sinB + z * cosB };
  };

  const rotateZ = (x: number, y: number, z: number) => {
    const cosC = Math.cos(C);
    const sinC = Math.sin(C);
    return { x: x * cosC - y * sinC, y: x * sinC + y * cosC, z };
  };

  const project = (x: number, y: number, z: number) => {
    let p = rotateX(x, y, z);
    p = rotateY(p.x, p.y, p.z);
    p = rotateZ(p.x, p.y, p.z);
    const scale = 10 / (10 + p.z);
    return {
      x: p.x * scale * 2.5,
      y: p.y * scale * 1.2,
      z: p.z,
    };
  };

  const width = 20;
  const height = 10;
  const buffer: { char: string; z: number }[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({ char: " ", z: -Infinity }))
  );

  const setPixel = (x: number, y: number, z: number, char: string) => {
    const px = Math.round(x + width / 2);
    const py = Math.round(y + height / 2);
    if (px >= 0 && px < width && py >= 0 && py < height) {
      if (z > buffer[py][px].z) {
        buffer[py][px] = { char, z };
      }
    }
  };

  // Draw cube edges
  const vertices = [
    [-size, -size, -size],
    [size, -size, -size],
    [size, size, -size],
    [-size, size, -size],
    [-size, -size, size],
    [size, -size, size],
    [size, size, size],
    [-size, size, size],
  ];

  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];

  const chars = "░▒▓█";

  edges.forEach(([a, b]) => {
    const [x1, y1, z1] = vertices[a];
    const [x2, y2, z2] = vertices[b];
    const steps = 15;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      const z = z1 + (z2 - z1) * t;
      const p = project(x, y, z);
      const charIdx = Math.floor(((p.z + size) / (size * 2)) * (chars.length - 1));
      setPixel(p.x, p.y, p.z, chars[Math.max(0, Math.min(chars.length - 1, charIdx))]);
    }
  });

  // Draw vertices with brighter chars
  vertices.forEach(([x, y, z]) => {
    const p = project(x, y, z);
    setPixel(p.x, p.y, p.z + 0.1, "█");
  });

  const output = buffer.map((row) => row.map((cell) => cell.char).join("")).join("\n");

  return (
    <pre className="font-vt323 text-terminal-glow text-[8px] leading-[8px] select-none opacity-70">
      {output}
    </pre>
  );
};

export default AsciiCube;
