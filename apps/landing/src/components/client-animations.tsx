'use client';

import { motion } from 'framer-motion';
import { Button } from '@nextsaas/ui';

interface AnimatedHeroProps {
  title: string;
  titleAccent: string;
  description: string;
  features: string[];
}

export function AnimatedHero({ title, titleAccent, description, features }: AnimatedHeroProps) {
  return (
    <>
      <motion.h1 
        className="text-6xl font-bold mb-6 text-gray-900 dark:text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {title}
        <span className="text-orange-600 dark:text-orange-400"> {titleAccent}</span>
      </motion.h1>
      <motion.p 
        className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        dangerouslySetInnerHTML={{ __html: description }}
      />
      <motion.div 
        className="flex gap-4 justify-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Button size="lg" className="font-semibold">Get Started Free</Button>
        <Button variant="outline" size="lg" className="font-semibold">View Demo</Button>
      </motion.div>
      <motion.div 
        className="flex flex-wrap gap-6 justify-center text-sm text-gray-500 dark:text-gray-400"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            {feature}
          </div>
        ))}
      </motion.div>
    </>
  );
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface AnimatedFeaturesProps {
  features: Feature[];
  title: string;
}

export function AnimatedFeatures({ features, title }: AnimatedFeaturesProps) {
  return (
    <>
      <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all bg-white dark:bg-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="text-3xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </>
  );
}

interface AnimatedSpotlightProps {
  features: {
    icon: string;
    title: string;
    description: string;
    items: string[];
    colorClass: string;
    borderClass: string;
  }[];
}

export function AnimatedSpotlight({ features }: AnimatedSpotlightProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          className={`bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg border-2 ${feature.borderClass}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <div className="text-4xl mb-4">{feature.icon}</div>
          <h3 className={`text-2xl font-semibold mb-4 ${feature.colorClass}`}>{feature.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {feature.description}
          </p>
          <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            {feature.items.map((item, itemIndex) => (
              <li key={itemIndex}>• {item}</li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  );
}