import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import Icon from '../../components/AppIcon';
import Image from '../../components/AppImage';




import LoginForm from './component/LoginForm';
import TwoFactorAuth from './component/TwoFactorAuth';
import TrustBadges from './component/TrustBadges';
import LanguageToggle from './component/LanguageToggle';

const Login = () => {
  const [language, setLanguage] = useState('en');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const translations = {
    en: {
      title: 'Afya Nyumbani Care System',
      subtitle: 'Professional Home Nursing Care Management',
      welcome: 'Welcome Back',
      description: 'Sign in to access your healthcare management dashboard',
      newUser: "Don\'t have an account?",
      register: 'Register as Client',
      footer: '© 2026 Afya Nyumbani Care System. All rights reserved.',
      compliance: 'Tanzania Health Data Regulation Compliant'
    },
    sw: {
      title: 'Mfumo wa Huduma za Afya Nyumbani',
      subtitle: 'Usimamizi wa Huduma za Uuguzi wa Nyumbani',
      welcome: 'Karibu Tena',
      description: 'Ingia ili kufikia dashibodi yako ya usimamizi wa afya',
      newUser: 'Huna akaunti?',
      register: 'Sajili kama Mteja',
      footer: '© 2026 Mfumo wa Huduma za Afya Nyumbani. Haki zote zimehifadhiwa.',
      compliance: 'Inafuata Kanuni za Data ya Afya ya Tanzania'
    }
  };

  const t = translations?.[language];

  const handleLoginSuccess = (email, role) => {
    setUserEmail(email);

    if (role === 'administrator') {
      setShowTwoFactor(true);
    } else {
      navigateToDashboard(role);
    }
  };

  const handleTwoFactorSuccess = () => {
    navigateToDashboard('administrator');
  };

  const navigateToDashboard = (role) => {
    switch (role) {
      case 'administrator':
      case 'support_staff':
        router.visit('/dashboard/admin');
        break;
      case 'practitioner':
        router.visit('/dashboard/practitioner');
        break;
      case 'client':
        router.visit('/dashboard/client');
        break;
      default:
        router.visit('/dashboard/admin');
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute top-4 right-4 md:top-6 md:right-6 lg:top-8 lg:right-8 z-50">
        <LanguageToggle language={language} onLanguageChange={handleLanguageChange} />
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-8 md:px-6 md:py-12 lg:px-8 lg:py-16">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="hidden lg:flex flex-col justify-center space-y-6 lg:space-y-8">
            <div className="space-y-4 lg:space-y-6">
              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                  <Icon name="Heart" size={24} color="var(--color-primary-foreground)" className="lg:w-8 lg:h-8" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground">
                    {t?.title}
                  </h1>
                  <p className="text-sm lg:text-base text-muted-foreground mt-1">
                    {t?.subtitle}
                  </p>
                </div>
              </div>

              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-start space-x-3 lg:space-x-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Shield" size={20} color="var(--color-success)" className="lg:w-6 lg:h-6" />
                  </div>
                  <div>
                    <h3 className="text-base lg:text-lg font-semibold text-foreground">
                      {language === 'en' ? 'Secure & Compliant' : 'Salama na Inayofuata Sheria'}
                    </h3>
                    <p className="text-sm lg:text-base text-muted-foreground mt-1">
                      {language === 'en' ? 'Enterprise-grade security with Tanzania health data regulation compliance' : 'Usalama wa kiwango cha juu ukifuata kanuni za data ya afya za Tanzania'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 lg:space-x-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Users" size={20} color="var(--color-primary)" className="lg:w-6 lg:h-6" />
                  </div>
                  <div>
                    <h3 className="text-base lg:text-lg font-semibold text-foreground">
                      {language === 'en' ? 'Comprehensive Care Management' : 'Usimamizi Kamili wa Huduma'}
                    </h3>
                    <p className="text-sm lg:text-base text-muted-foreground mt-1">
                      {language === 'en' ? 'Manage patients, practitioners, inventory, and finances in one platform' : 'Simamia wagonjwa, wataalamu, vifaa, na fedha katika jukwaa moja'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 lg:space-x-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="MapPin" size={20} color="var(--color-accent)" className="lg:w-6 lg:h-6" />
                  </div>
                  <div>
                    <h3 className="text-base lg:text-lg font-semibold text-foreground">
                      {language === 'en' ? 'Location-Based Services' : 'Huduma za Eneo'}
                    </h3>
                    <p className="text-sm lg:text-base text-muted-foreground mt-1">
                      {language === 'en' ? 'GPS-enabled practitioner assignment for efficient home care delivery' : 'Upangaji wa wataalamu kwa kutumia GPS kwa utoaji bora wa huduma za nyumbani'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 lg:pt-8 border-t border-border">
              <Image
                src="https://img.rocket.new/generatedImages/rocket_gen_img_12213ec34-1766514189165.png"
                alt="Professional African female nurse in white uniform with stethoscope smiling warmly while reviewing patient records on tablet in modern healthcare facility"
                className="w-full h-64 lg:h-80 object-cover rounded-xl shadow-lg" />

            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="lg:hidden mb-6 md:mb-8 text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                  <Icon name="Heart" size={24} color="var(--color-primary-foreground)" className="md:w-7 md:h-7" />
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">
                  {t?.title}
                </h1>
              </div>
              <p className="text-sm md:text-base text-muted-foreground">
                {t?.subtitle}
              </p>
            </div>

            <div className="bg-card rounded-xl shadow-xl border border-border p-6 md:p-8 lg:p-10">
              <div className="mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  {t?.welcome}
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  {t?.description}
                </p>
              </div>

              {!showTwoFactor ?
              <LoginForm
                language={language}
                onLoginSuccess={handleLoginSuccess} /> :


              <TwoFactorAuth
                language={language}
                email={userEmail}
                onVerifySuccess={handleTwoFactorSuccess}
                onBack={() => setShowTwoFactor(false)} />

              }

              <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-border">
                <p className="text-center text-sm md:text-base text-muted-foreground">
                  {t?.newUser}{' '}
                  <button className="text-primary hover:text-primary/80 font-medium transition-colors duration-250 ease-out">
                    {t?.register}
                  </button>
                </p>
              </div>

              <TrustBadges language={language} />
            </div>
          </div>
        </div>
      </div>
      <footer className="py-4 md:py-6 px-4 md:px-6 lg:px-8 border-t border-border bg-card">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
          <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
            {t?.footer}
          </p>
          <p className="text-xs md:text-sm text-muted-foreground text-center md:text-right">
            {t?.compliance}
          </p>
        </div>
      </footer>
    </div>);

};

export default Login;