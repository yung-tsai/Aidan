import { useState, useEffect } from "react";

const AsciiPyramid = () => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const width = 12;
  const height = 6;
  const A = (frame * Math.PI) / 180;

  // Fixed size buffer
  const buffer: string[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => " ")
  );

  const setPixel = (x: number, y: number, char: string) => {
    const px = Math.round(x);
    const py = Math.round(y);
    if (px >= 0 && px < width && py >= 0 && py < height) {
      buffer[py][px] = char;
    }
  };

  // Pyramid vertices (apex + 4 base corners)
  const apex = [0, -2, 0];
  const base = [
    [-2, 1.5, -2],
    [2, 1.5, -2],
    [2, 1.5, 2],
    [-2, 1.5, 2],
  ];

  const rotate = (x: number, y: number, z: number) => {
    const cosA = Math.cos(A);
    const sinA = Math.sin(A);
    return {
      x: x * cosA + z * sinA,
      y,
      z: -x * sinA + z * cosA,
    };
  };

  const project = (x: number, y: number, z: number) => {
    const p = rotate(x, y, z);
    const scale = 6 / (6 + p.z);
    return {
      x: p.x * scale * 1.8 + width / 2,
      y: p.y * scale + height / 2,
      z: p.z,
    };
  };

  const drawLine = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, char: string) => {
    const p1 = project(x1, y1, z1);
    const p2 = project(x2, y2, z2);
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = p1.x + (p2.x - p1.x) * t;
      const y = p1.y + (p2.y - p1.y) * t;
      setPixel(x, y, char);
    }
  };

  // Draw base edges
  for (let i = 0; i < 4; i++) {
    const [x1, y1, z1] = base[i];
    const [x2, y2, z2] = base[(i + 1) % 4];
    drawLine(x1, y1, z1, x2, y2, z2, "░");
  }

  // Draw edges from apex to base
  const chars = ["▓", "▒", "░", "▒"];
  for (let i = 0; i < 4; i++) {
    const [x, y, z] = base[i];
    const [ax, ay, az] = apex;
    drawLine(ax, ay, az, x, y, z, chars[i]);
  }

  // Draw apex
  const ap = project(apex[0], apex[1], apex[2]);
  setPixel(ap.x, ap.y, "█");

  const output = buffer.map((row) => row.join("")).join("\n");

  return (
    <pre 
      className="font-vt323 text-terminal-glow text-[10px] leading-[10px] select-none opacity-60"
      style={{ width: `${width * 6}px`, height: `${height * 10}px` }}
    >
      {output}
    </pre>
  );
};

export default AsciiPyramid;
