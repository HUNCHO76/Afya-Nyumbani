import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

const Icon: React.FC<IconProps> = ({ name, size = 24, className = '', strokeWidth = 2 }) => {
  // Get the icon component from lucide-react
  const IconComponent = (LucideIcons as any)[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    // Return a default icon or nothing
    return (
      <LucideIcons.HelpCircle
        size={size}
        className={className}
        strokeWidth={strokeWidth}
      />
    );
  }

  return (
    <IconComponent
      size={size}
      className={className}
      strokeWidth={strokeWidth}
    />
  );
};

export default Icon;
