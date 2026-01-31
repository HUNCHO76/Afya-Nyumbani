import React from 'react';
import Icon from '@/components/AppIcon';

const TrustBadges = ({ language }) => {
  const translations = {
    en: {
      secureConnection: 'Secure SSL Connection',
      dataProtection: 'Tanzania Data Protection Act Compliant',
      healthRegulation: 'Ministry of Health Certified',
      encryption: '256-bit Encryption'
    },
    sw: {
      secureConnection: 'Muunganisho Salama wa SSL',
      dataProtection: 'Inafuata Sheria ya Ulinzi wa Data ya Tanzania',
      healthRegulation: 'Imethibitishwa na Wizara ya Afya',
      encryption: 'Usimbaji wa Biti 256'
    }
  };

  const t = translations?.[language];

  const badges = [
    { icon: 'Lock', text: t?.secureConnection, color: 'var(--color-success)' },
    { icon: 'Shield', text: t?.dataProtection, color: 'var(--color-primary)' },
    { icon: 'Award', text: t?.healthRegulation, color: 'var(--color-accent)' },
    { icon: 'Key', text: t?.encryption, color: 'var(--color-success)' }
  ];

  return (
    <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-border">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {badges?.map((badge, index) => (
          <div
            key={index}
            className="flex items-center space-x-2 md:space-x-3 p-3 md:p-4 bg-muted/30 rounded-md border border-border"
          >
            <Icon name={badge?.icon} size={18} color={badge?.color} className="flex-shrink-0 md:w-5 md:h-5" />
            <span className="text-xs md:text-sm text-muted-foreground">
              {badge?.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustBadges;