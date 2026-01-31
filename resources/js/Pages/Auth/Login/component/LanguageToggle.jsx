import React from 'react';
import Icon from '@/components/AppIcon';

const LanguageToggle = ({ language, onLanguageChange }) => {
  const toggleLanguage = () => {
    onLanguageChange(language === 'en' ? 'sw' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 md:space-x-3 px-4 py-2 md:px-5 md:py-3 bg-card border border-border rounded-md shadow-md hover:shadow-lg transition-all duration-250 ease-out"
      aria-label="Toggle language"
    >
      <Icon name="Languages" size={20} className="md:w-6 md:h-6" />
      <span className="text-sm md:text-base font-medium text-foreground">
        {language === 'en' ? 'English' : 'Kiswahili'}
      </span>
      <Icon name="ChevronDown" size={16} className="md:w-5 md:h-5" />
    </button>
  );
};

export default LanguageToggle;