import React from 'react';
import { Button } from '@/components/ui/button';

interface LanguageToggleProps {
  language: 'en' | 'sw';
  onLanguageChange: (language: 'en' | 'sw') => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ language, onLanguageChange }) => {
  return (
    <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1 shadow-sm">
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onLanguageChange('en')}
        className="text-xs font-medium"
      >
        EN
      </Button>
      <Button
        variant={language === 'sw' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onLanguageChange('sw')}
        className="text-xs font-medium"
      >
        SW
      </Button>
    </div>
  );
};

export default LanguageToggle;