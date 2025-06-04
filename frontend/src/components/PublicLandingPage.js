import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

/**
 * Public Landing Page component
 * Displays the initial public screen with options to sign up or login
 */
const PublicLandingPage = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t('publicLanding.title')}
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              {t('publicLanding.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/signup"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors"
              >
                {t('publicLanding.signUp')}
              </Link>
              <Link
                to="/login"
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors"
              >
                {t('publicLanding.login')}
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="/images/job-ticket-hero.svg" 
              alt="Job Ticket Invoice Platform" 
              className="w-full max-w-md mx-auto"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/600x400?text=Job+Ticket+Platform';
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="bg-slate-800 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('publicLanding.featuresTitle')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-700 p-6 rounded-lg">
              <div className="text-orange-500 text-4xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">{t('publicLanding.feature1Title')}</h3>
              <p className="text-gray-300">{t('publicLanding.feature1Description')}</p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-slate-700 p-6 rounded-lg">
              <div className="text-orange-500 text-4xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">{t('publicLanding.feature2Title')}</h3>
              <p className="text-gray-300">{t('publicLanding.feature2Description')}</p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-slate-700 p-6 rounded-lg">
              <div className="text-orange-500 text-4xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">{t('publicLanding.feature3Title')}</h3>
              <p className="text-gray-300">{t('publicLanding.feature3Description')}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">{t('publicLanding.ctaTitle')}</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">{t('publicLanding.ctaDescription')}</p>
        <Link
          to="/signup"
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg inline-block transition-colors"
        >
          {t('publicLanding.getStarted')}
        </Link>
      </div>
    </div>
  );
};

export default PublicLandingPage;
