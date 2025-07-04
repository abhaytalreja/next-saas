'use client'

import { Button, LanguageSelector } from '@nextsaas/ui'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTranslation } from 'next-i18next'

export default function LandingPage() {
  const { t } = useTranslation('common');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold">NextSaaS</div>
        <div className="flex gap-6 items-center">
          <Link href="http://localhost:3001" className="hover:text-gray-600">{t('navigation.docs')}</Link>
          <Link href="/pricing" className="hover:text-gray-600">{t('navigation.pricing')}</Link>
          <Link href="/blog" className="hover:text-gray-600">{t('navigation.blog')}</Link>
          <LanguageSelector />
          <Button variant="outline" size="sm">{t('navigation.signIn')}</Button>
          <Button size="sm">{t('navigation.getStarted')}</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.h1 
          className="text-6xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t('hero.title')}
          <span className="text-blue-600"> {t('hero.titleAccent')}</span>
        </motion.h1>
        <motion.p 
          className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {t('hero.description')}
        </motion.p>
        <motion.div 
          className="flex gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button size="lg">{t('hero.getStartedFree')}</Button>
          <Button variant="outline" size="lg">{t('hero.viewDemo')}</Button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">{t('features.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {getFeatures(t).map((feature, index) => (
            <motion.div
              key={feature.title}
              className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold mb-4">{t('cta.title')}</h2>
          <p className="text-xl mb-8 text-gray-300">
            {t('cta.description')}
          </p>
          <Button size="lg" variant="secondary">
            {t('cta.startBuildingToday')}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600">
          <p>{t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  )
}

const getFeatures = (t: any) => [
  {
    icon: '🚀',
    title: t('features.productionReady.title'),
    description: t('features.productionReady.description')
  },
  {
    icon: '🔒',
    title: t('features.authentication.title'),
    description: t('features.authentication.description')
  },
  {
    icon: '💳',
    title: t('features.payments.title'),
    description: t('features.payments.description')
  },
  {
    icon: '🎨',
    title: t('features.uiComponents.title'),
    description: t('features.uiComponents.description')
  },
  {
    icon: '📊',
    title: t('features.analytics.title'),
    description: t('features.analytics.description')
  },
  {
    icon: '🔧',
    title: t('features.developerExperience.title'),
    description: t('features.developerExperience.description')
  }
]