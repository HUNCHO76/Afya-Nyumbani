import React, { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/AppIcon';

interface TwoFactorAuthProps {
  language: 'en' | 'sw';
  email: string;
  onVerifySuccess: () => void;
  onBack: () => void;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({
  language,
  email,
  onVerifySuccess,
  onBack,
}) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const translations = {
    en: {
      title: 'Two-Factor Authentication',
      description: `Enter the 6-digit code sent to ${email}`,
      code: 'Verification Code',
      codePlaceholder: 'Enter 6-digit code',
      verify: 'Verify',
      verifying: 'Verifying...',
      back: 'Back to login',
      resend: 'Resend code',
      invalidCode: 'Invalid verification code',
    },
    sw: {
      title: 'Uthibitisho wa Hatua Mbili',
      description: `Ingiza msimbo wa tarakimu 6 uliotumwa kwa ${email}`,
      code: 'Msimbo wa Uthibitisho',
      codePlaceholder: 'Ingiza msimbo wa tarakimu 6',
      verify: 'Thibitisha',
      verifying: 'Inathibitisha...',
      back: 'Rudi kwa kuingia',
      resend: 'Tuma msimbo tena',
      invalidCode: 'Msimbo wa uthibitisho si sahihi',
    },
  };

  const t = translations[language];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (code === '123456') {
        onVerifySuccess();
      } else {
        setError(t.invalidCode);
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon name="Shield" size={32} color="var(--color-primary)" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">{t.title}</h3>
        <p className="text-sm text-muted-foreground">{t.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="code">{t.code}</Label>
          <Input
            id="code"
            type="text"
            placeholder={t.codePlaceholder}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            required
            disabled={isLoading}
            className="text-center text-2xl tracking-widest"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
          {isLoading ? t.verifying : t.verify}
        </Button>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ← {t.back}
          </button>
          <button
            type="button"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            {t.resend}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TwoFactorAuth;