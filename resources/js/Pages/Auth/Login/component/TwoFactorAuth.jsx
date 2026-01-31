import React, { useState, useEffect, useRef } from 'react';
import Icon from '@/components/AppIcon';
import { Button } from '@/components/ui/button';

const TwoFactorAuth = ({ language, email, onVerifySuccess, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef([]);

  const translations = {
    en: {
      title: 'Two-Factor Authentication',
      description: 'Enter the 6-digit code sent to',
      codePlaceholder: 'Enter code',
      verify: 'Verify Code',
      verifying: 'Verifying...',
      resendCode: 'Resend Code',
      resendIn: 'Resend in',
      seconds: 'seconds',
      back: 'Back to Login',
      invalidCode: 'Invalid verification code. Please try again.',
      codeResent: 'Verification code has been resent to your email'
    },
    sw: {
      title: 'Uthibitisho wa Hatua Mbili',
      description: 'Weka nambari ya tarakimu 6 iliyotumwa kwa',
      codePlaceholder: 'Weka nambari',
      verify: 'Thibitisha Nambari',
      verifying: 'Inathibitisha...',
      resendCode: 'Tuma Tena Nambari',
      resendIn: 'Tuma tena baada ya',
      seconds: 'sekunde',
      back: 'Rudi Kuingia',
      invalidCode: 'Nambari ya uthibitisho si sahihi. Tafadhali jaribu tena.',
      codeResent: 'Nambari ya uthibitisho imetumwa tena kwa barua pepe yako'
    }
  };

  const t = translations?.[language];
  const mockOtp = '123456';

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (inputRefs?.current?.[0]) {
      inputRefs?.current?.[0]?.focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/?.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value?.slice(-1);
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs?.current?.[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e?.key === 'Backspace' && !otp?.[index] && index > 0) {
      inputRefs?.current?.[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e?.preventDefault();
    const pastedData = e?.clipboardData?.getData('text')?.slice(0, 6);
    if (!/^\d+$/?.test(pastedData)) return;

    const newOtp = pastedData?.split('')?.concat(Array(6 - pastedData?.length)?.fill(''));
    setOtp(newOtp);
    
    const nextEmptyIndex = newOtp?.findIndex(val => !val);
    if (nextEmptyIndex !== -1) {
      inputRefs?.current?.[nextEmptyIndex]?.focus();
    } else {
      inputRefs?.current?.[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp?.join('');
    
    if (otpValue?.length !== 6) {
      setError(t?.invalidCode);
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (otpValue === mockOtp) {
        onVerifySuccess();
      } else {
        setError(t?.invalidCode);
        setOtp(['', '', '', '', '', '']);
        inputRefs?.current?.[0]?.focus();
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleResend = () => {
    setResendTimer(60);
    setOtp(['', '', '', '', '', '']);
    setError('');
    inputRefs?.current?.[0]?.focus();
    
    setTimeout(() => {
      setError('');
    }, 3000);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon name="ShieldCheck" size={32} color="var(--color-primary)" className="md:w-10 md:h-10" />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
          {t?.title}
        </h3>
        <p className="text-sm md:text-base text-muted-foreground">
          {t?.description}
        </p>
        <p className="text-sm md:text-base font-medium text-foreground mt-2">
          {email}
        </p>
      </div>
      <div className="space-y-4 md:space-y-6">
        <div className="flex justify-center gap-2 md:gap-3">
          {otp?.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e?.target?.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={isLoading}
              className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-center text-xl md:text-2xl font-bold border-2 border-input rounded-md focus:border-primary focus:ring-3 focus:ring-ring focus:ring-offset-3 transition-all duration-250 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center justify-center space-x-2 p-3 md:p-4 bg-destructive/10 border border-destructive/20 rounded-md">
            <Icon name="AlertCircle" size={20} color="var(--color-destructive)" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={onBack}
            disabled={isLoading}
            iconName="ArrowLeft"
            iconPosition="left"
          >
            {t?.back}
          </Button>
          <Button
            type="button"
            variant="default"
            fullWidth
            onClick={handleVerify}
            loading={isLoading}
            iconName="ShieldCheck"
            iconPosition="right"
          >
            {isLoading ? t?.verifying : t?.verify}
          </Button>
        </div>

        <div className="text-center pt-4 md:pt-6 border-t border-border">
          {resendTimer > 0 ? (
            <p className="text-sm md:text-base text-muted-foreground">
              {t?.resendIn} <span className="font-semibold text-foreground">{resendTimer}</span> {t?.seconds}
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-sm md:text-base text-primary hover:text-primary/80 font-medium transition-colors duration-250 ease-out"
            >
              {t?.resendCode}
            </button>
          )}
        </div>
      </div>
      <div className="p-4 md:p-6 bg-muted/50 rounded-md border border-border">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
          <div className="text-sm md:text-base text-muted-foreground">
            <p className="font-medium text-foreground mb-1">
              {language === 'en' ? 'Mock Credentials for Testing' : 'Taarifa za Majaribio'}
            </p>
            <p>
              {language === 'en' 
                ? `Use verification code: ${mockOtp}` 
                : `Tumia nambari ya uthibitisho: ${mockOtp}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth;