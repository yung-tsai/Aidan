import { useState, useEffect, useRef } from 'react';

interface TypewriterResult {
  text: string;
  isTyping: boolean;
  showCursor: boolean;
}

export const useTypewriter = (fullText: string, speed: number = 30): TypewriterResult => {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const timeoutRef = useRef<number | null>(null);
  const cursorIntervalRef = useRef<number | null>(null);

  // Blinking cursor effect
  useEffect(() => {
    cursorIntervalRef.current = window.setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => {
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
      }
    };
  }, []);

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

  const isTyping = displayedText.length < fullText.length;

  return { text: displayedText, isTyping, showCursor };
};
