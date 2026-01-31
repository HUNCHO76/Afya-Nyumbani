import React from 'react';
import Icon from '@/components/AppIcon';

interface TrustBadgesProps {
  language: 'en' | 'sw';
}

const TrustBadges: React.FC<TrustBadgesProps> = ({ language }) => {
  const translations = {
    en: {
      encrypted: 'SSL Encrypted',
      compliant: 'HIPAA Compliant',
      verified: 'Verified Platform',
    },
    sw: {
      encrypted: 'Iliyofungwa kwa SSL',
      compliant: 'Inafuata HIPAA',
      verified: 'Jukwaa Lililothibitishwa',
    },
  };

  const t = translations[language];

  return (
    <div className="mt-6 pt-6 border-t border-border">
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center text-center">
          <Icon name="Lock" size={20} color="var(--color-muted-foreground)" />
          <span className="text-xs text-muted-foreground mt-2">{t.encrypted}</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <Icon name="Shield" size={20} color="var(--color-muted-foreground)" />
          <span className="text-xs text-muted-foreground mt-2">{t.compliant}</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <Icon name="CheckCircle" size={20} color="var(--color-muted-foreground)" />
          <span className="text-xs text-muted-foreground mt-2">{t.verified}</span>
        </div>
      </div>
    </div>
  );
};

export default TrustBadges;