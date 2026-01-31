import React, { useState, FormEvent } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/AppIcon';

interface LoginFormProps {
  language: 'en' | 'sw';
  onLoginSuccess: (email: string, role: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ language, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const translations = {
    en: {
      email: 'Email Address',
      emailPlaceholder: 'Enter your email',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      forgotPassword: 'Forgot password?',
      signIn: 'Sign In',
      signingIn: 'Signing in...',
      invalidCredentials: 'Invalid email or password',
    },
    sw: {
      email: 'Barua Pepe',
      emailPlaceholder: 'Ingiza barua pepe yako',
      password: 'Nenosiri',
      passwordPlaceholder: 'Ingiza nenosiri lako',
      forgotPassword: 'Umesahau nenosiri?',
      signIn: 'Ingia',
      signingIn: 'Inaingia...',
      invalidCredentials: 'Barua pepe au nenosiri si sahihi',
    },
  };

  const t = translations[language];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      router.post('/login', {
        email,
        password,
      }, {
        onSuccess: (page) => {
          const user = page.props.auth?.user;
          if (user) {
            onLoginSuccess(user.email, user.role);
          }
        },
        onError: (errors) => {
          setError(errors.email || errors.password || t.invalidCredentials);
        },
        onFinish: () => {
          setIsLoading(false);
        },
      });
    } catch (err) {
      setError(t.invalidCredentials);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">{t.email}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{t.password}</Label>
          <button
            type="button"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            {t.forgotPassword}
          </button>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="w-full pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            disabled={isLoading}
          >
            <Icon
              name={showPassword ? 'EyeOff' : 'Eye'}
              size={20}
            />
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? t.signingIn : t.signIn}
      </Button>
    </form>
  );
};

export default LoginForm;