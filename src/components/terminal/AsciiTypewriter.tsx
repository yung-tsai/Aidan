import { useState, useEffect } from "react";

interface AsciiTypewriterProps {
  wordCount: number;
}

const AsciiTypewriter = ({ wordCount }: AsciiTypewriterProps) => {
  const [frame, setFrame] = useState(0);

  // Animate when word count changes
  useEffect(() => {
    if (wordCount > 0) {
      const timer = setTimeout(() => {
        setFrame((prev) => (prev + 1) % 4);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [wordCount]);

  const typewriterFrames = [
    `┌───────┐
│ ═══   │
│  ║    │
└───────┘`,
    `┌───────┐
│ ═══   │
│   ║   │
└───────┘`,
    `┌───────┐
│ ═══   │
│    ║  │
└───────┘`,
    `┌───────┐
│ ═══   │
│   ║   │
└───────┘`,
  ];

  return (
    <div className="flex items-center gap-3">
      <pre className="font-vt323 text-terminal-dim text-[8px] leading-none">
        {typewriterFrames[frame]}
      </pre>
      <div className="text-terminal-dim text-xs font-vt323">
        <div className="text-terminal-text">{wordCount}</div>
        <div className="text-[10px]">WORDS</div>
      </div>
    </div>
  );
};

export default AsciiTypewriter;
