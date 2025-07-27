import React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Link,
  Img,
  Hr,
  Code,
  Tailwind
} from '@react-email/components';
import { BaseTemplate, BaseTemplateProps } from '../base/BaseTemplate';
import { tailwindConfig } from '../config/tailwind';

export interface TechUpdate {
  type: 'feature' | 'improvement' | 'bugfix' | 'api';
  title: string;
  description: string;
  codeExample?: string;
  documentationUrl?: string;
}

export interface TechSaasTemplateProps extends Omit<BaseTemplateProps, 'children'> {
  title: string;
  subtitle?: string;
  updates: TechUpdate[];
  changelogUrl?: string;
  apiDocsUrl?: string;
  supportUrl?: string;
}

const getUpdateTypeColor = (type: TechUpdate['type']) => {
  switch (type) {
    case 'feature':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'improvement':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'bugfix':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'api':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getUpdateTypeIcon = (type: TechUpdate['type']) => {
  switch (type) {
    case 'feature':
      return '✨';
    case 'improvement':
      return '⚡';
    case 'bugfix':
      return '🐛';
    case 'api':
      return '🔧';
    default:
      return '📝';
  }
};

export const TechSaasTemplate: React.FC<TechSaasTemplateProps> = ({
  title,
  subtitle,
  updates,
  changelogUrl,
  apiDocsUrl,
  supportUrl,
  ...baseProps
}) => {
  return (
    <BaseTemplate {...baseProps}>
      <Container className="mx-auto max-w-2xl bg-white">
        {/* Header */}
        <Section className="bg-slate-900 px-6 py-8 text-center">
          <Heading className="text-2xl font-bold text-white mb-2">
            {title}
          </Heading>
          {subtitle && (
            <Text className="text-slate-300 text-sm">
              {subtitle}
            </Text>
          )}
        </Section>

        {/* Updates */}
        <Section className="px-6 py-8">
          <Heading className="text-xl font-bold text-gray-900 mb-6">
            What's New
          </Heading>
          
          {updates.map((update, index) => (
            <Section key={index} className="mb-8 last:mb-0">
              <Section className="flex items-start space-x-3 mb-3">
                <Text className="text-lg">{getUpdateTypeIcon(update.type)}</Text>
                <Section className="flex-1">
                  <Section className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUpdateTypeColor(update.type)}`}>
                      {update.type.toUpperCase()}
                    </span>
                  </Section>
                  
                  <Heading className="text-lg font-semibold text-gray-900 mb-2">
                    {update.title}
                  </Heading>
                  
                  <Text className="text-gray-600 mb-3 leading-relaxed">
                    {update.description}
                  </Text>
                  
                  {update.codeExample && (
                    <Section className="bg-slate-900 rounded-lg p-4 mb-3">
                      <Code className="text-sm text-slate-300 font-mono">
                        {update.codeExample}
                      </Code>
                    </Section>
                  )}
                  
                  {update.documentationUrl && (
                    <Link
                      href={update.documentationUrl}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View Documentation →
                    </Link>
                  )}
                </Section>
              </Section>
              
              {index < updates.length - 1 && (
                <Hr className="border-gray-200 my-6" />
              )}
            </Section>
          ))}
        </Section>

        {/* Quick Links */}
        <Section className="bg-gray-50 px-6 py-6 mx-6 rounded-lg">
          <Heading className="text-lg font-semibold text-gray-900 mb-4">
            Quick Links
          </Heading>
          
          <Section className="grid grid-cols-1 gap-3">
            {changelogUrl && (
              <Link
                href={changelogUrl}
                className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <Text className="text-sm">📋</Text>
                <Text className="text-sm font-medium">Full Changelog</Text>
              </Link>
            )}
            
            {apiDocsUrl && (
              <Link
                href={apiDocsUrl}
                className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <Text className="text-sm">📚</Text>
                <Text className="text-sm font-medium">API Documentation</Text>
              </Link>
            )}
            
            {supportUrl && (
              <Link
                href={supportUrl}
                className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <Text className="text-sm">💬</Text>
                <Text className="text-sm font-medium">Get Support</Text>
              </Link>
            )}
          </Section>
        </Section>

        {/* Footer */}
        <Section className="px-6 py-6 text-center">
          <Text className="text-gray-500 text-xs">
            You're receiving this email because you're subscribed to our technical updates.{' '}
            <Link href={baseProps.unsubscribeUrl} className="text-primary-600 underline">
              Unsubscribe
            </Link>
          </Text>
        </Section>
      </Container>
    </BaseTemplate>
  );
};