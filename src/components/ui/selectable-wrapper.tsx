import { useState } from 'react';
import { StarBorder } from './star-border';

interface SelectableWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function SelectableWrapper({ children, className }: SelectableWrapperProps) {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <div 
      onClick={() => setIsSelected(!isSelected)}
      className={className}
    >
      {isSelected ? (
        <StarBorder as="div" className="w-full">
          {children}
        </StarBorder>
      ) : children}
    </div>
  );
} 