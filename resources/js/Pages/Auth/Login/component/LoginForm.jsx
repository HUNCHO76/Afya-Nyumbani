import React, { useState } from 'react';
import Icon from '@/components/AppIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';

const LoginForm = ({ language, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'administrator',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const translations = {
    en: {
      email: 'Email Address',
      emailPlaceholder: 'Enter your email',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      role: 'Login As',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      signIn: 'Sign In',
      signingIn: 'Signing In...',
      invalidCredentials: 'Invalid email or password. Please try again.',
      requiredField: 'This field is required',
      invalidEmail: 'Please enter a valid email address'
    },
    sw: {
      email: 'Barua Pepe',
      emailPlaceholder: 'Weka barua pepe yako',
      password: 'Nywila',
      passwordPlaceholder: 'Weka nywila yako',
      role: 'Ingia Kama',
      rememberMe: 'Nikumbuke',
      forgotPassword: 'Umesahau nywila?',
      signIn: 'Ingia',
      signingIn: 'Inaingia...',
      invalidCredentials: 'Barua pepe au nywila si sahihi. Tafadhali jaribu tena.',
      requiredField: 'Sehemu hii inahitajika',
      invalidEmail: 'Tafadhali weka barua pepe sahihi'
    }
  };

  const t = translations?.[language];

  const roleOptions = [
    { 
      value: 'administrator', 
      label: language === 'en' ? 'Administrator' : 'Msimamizi',
      description: language === 'en' ? 'Full system access' : 'Ufikiaji kamili wa mfumo'
    },
    { 
      value: 'practitioner', 
      label: language === 'en' ? 'Healthcare Practitioner' : 'Mtaalamu wa Afya',
      description: language === 'en' ? 'Nurse, doctor, therapist' : 'Muuguzi, daktari, mtaalam'
    },
    { 
      value: 'client', 
      label: language === 'en' ? 'Client/Patient' : 'Mteja/Mgonjwa',
      description: language === 'en' ? 'Book and track care' : 'Weka miadi na fuatilia huduma'
    },
    { 
      value: 'support_staff', 
      label: language === 'en' ? 'Support Staff' : 'Wafanyakazi wa Usaidizi',
      description: language === 'en' ? 'Office and scheduling' : 'Ofisi na ratiba'
    }
  ];

  const mockCredentials = {
    administrator: { email: 'admin@afyakongwe.co.tz', password: 'Admin@2026' },
    practitioner: { email: 'nurse@afyakongwe.co.tz', password: 'Nurse@2026' },
    client: { email: 'patient@afyakongwe.co.tz', password: 'Patient@2026' },
    support_staff: { email: 'support@afyakongwe.co.tz', password: 'Support@2026' }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.email) {
      newErrors.email = t?.requiredField;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = t?.invalidEmail;
    }

    if (!formData?.password) {
      newErrors.password = t?.requiredField;
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    setTimeout(() => {
      const credentials = mockCredentials?.[formData?.role];
      
      if (formData?.email === credentials?.email && formData?.password === credentials?.password) {
        onLoginSuccess(formData?.email, formData?.role);
      } else {
        setErrors({ submit: t?.invalidCredentials });
      }
      
      setIsLoading(false);
    }, 1500);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      <Select
        label={t?.role}
        options={roleOptions}
        value={formData?.role}
        onChange={(value) => handleChange('role', value)}
        required
      />
      <Input
        type="email"
        label={t?.email}
        placeholder={t?.emailPlaceholder}
        value={formData?.email}
        onChange={(e) => handleChange('email', e?.target?.value)}
        error={errors?.email}
        required
        disabled={isLoading}
      />
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          label={t?.password}
          placeholder={t?.passwordPlaceholder}
          value={formData?.password}
          onChange={(e) => handleChange('password', e?.target?.value)}
          error={errors?.password}
          required
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors duration-250 ease-out"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
        </button>
      </div>
      {errors?.submit && (
        <div className="flex items-center space-x-2 p-3 md:p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <Icon name="AlertCircle" size={20} color="var(--color-destructive)" />
          <p className="text-sm text-destructive">{errors?.submit}</p>
        </div>
      )}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Checkbox
          label={t?.rememberMe}
          checked={formData?.rememberMe}
          onChange={(e) => handleChange('rememberMe', e?.target?.checked)}
          disabled={isLoading}
        />
        <button
          type="button"
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-250 ease-out"
        >
          {t?.forgotPassword}
        </button>
      </div>
      <Button
        type="submit"
        variant="default"
        fullWidth
        loading={isLoading}
        iconName="LogIn"
        iconPosition="right"
      >
        {isLoading ? t?.signingIn : t?.signIn}
      </Button>
    </form>
  );
};

export default LoginForm;