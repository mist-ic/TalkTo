'use client';

import { useAnimatedText } from './animated-text';

interface AnimatedMessageProps {
  content: string;
  delimiter?: string;
}

export const AnimatedMessage = ({ content, delimiter = '' }: AnimatedMessageProps) => {
  const animatedText = useAnimatedText(content, delimiter);
  
  return (
    <p className="text-sm whitespace-pre-wrap">
      {animatedText}
    </p>
  );
}; 