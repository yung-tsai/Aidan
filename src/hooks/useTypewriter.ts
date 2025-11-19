import { useState, useEffect, useRef } from 'react';

export const useTypewriter = (fullText: string, speed: number = 30): string => {
  const [displayedText, setDisplayedText] = useState('');
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // If displayedText is already caught up with fullText, do nothing
    if (displayedText === fullText) {
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If fullText is shorter (e.g., reset), reset displayedText immediately
    if (fullText.length < displayedText.length) {
      setDisplayedText(fullText);
      return;
    }

    // If we need to catch up, add one character at a time
    if (displayedText.length < fullText.length) {
      timeoutRef.current = window.setTimeout(() => {
        setDisplayedText(fullText.slice(0, displayedText.length + 1));
      }, speed);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fullText, displayedText, speed]);

  return displayedText;
};
