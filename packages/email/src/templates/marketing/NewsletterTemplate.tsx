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
  Tailwind
} from '@react-email/components';
import { BaseTemplate, BaseTemplateProps } from '../base/BaseTemplate';
import { tailwindConfig } from '../config/tailwind';

export interface NewsletterArticle {
  title: string;
  excerpt: string;
  imageUrl?: string;
  readMoreUrl: string;
  category?: string;
}

export interface NewsletterTemplateProps extends Omit<BaseTemplateProps, 'children'> {
  newsletterTitle: string;
  articles: NewsletterArticle[];
  footerText?: string;
  socialLinks?: {
    platform: string;
    url: string;
    iconUrl?: string;
  }[];
}

export const NewsletterTemplate: React.FC<NewsletterTemplateProps> = ({
  newsletterTitle,
  articles,
  footerText,
  socialLinks,
  ...baseProps
}) => {
  return (
    <BaseTemplate {...baseProps}>
      <Container className="mx-auto max-w-2xl bg-white">
        {/* Header */}
        <Section className="bg-primary-600 px-6 py-8 text-center">
          <Heading className="text-2xl font-bold text-white mb-2">
            {newsletterTitle}
          </Heading>
          <Text className="text-primary-100 text-sm">
            {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </Section>

        {/* Articles */}
        <Section className="px-6 py-8">
          {articles.map((article, index) => (
            <React.Fragment key={index}>
              <Section className="mb-8">
                {article.imageUrl && (
                  <Img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                
                {article.category && (
                  <Text className="text-xs uppercase font-semibold text-primary-600 mb-2 tracking-wide">
                    {article.category}
                  </Text>
                )}
                
                <Heading className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                  {article.title}
                </Heading>
                
                <Text className="text-gray-600 mb-4 leading-relaxed">
                  {article.excerpt}
                </Text>
                
                <Button
                  href={article.readMoreUrl}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  Read More
                </Button>
              </Section>
              
              {index < articles.length - 1 && (
                <Hr className="border-gray-200 my-8" />
              )}
            </React.Fragment>
          ))}
        </Section>

        {/* Social Links */}
        {socialLinks && socialLinks.length > 0 && (
          <Section className="px-6 py-6 bg-gray-50 text-center">
            <Text className="text-gray-600 mb-4 text-sm">
              Follow us on social media
            </Text>
            <Section className="flex justify-center space-x-4">
              {socialLinks.map((social, index) => (
                <Link
                  key={index}
                  href={social.url}
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  {social.iconUrl ? (
                    <Img
                      src={social.iconUrl}
                      alt={social.platform}
                      className="w-6 h-6"
                    />
                  ) : (
                    <Text className="text-sm font-medium">{social.platform}</Text>
                  )}
                </Link>
              ))}
            </Section>
          </Section>
        )}

        {/* Footer */}
        <Section className="px-6 py-6 bg-gray-100 text-center">
          {footerText && (
            <Text className="text-gray-600 text-sm mb-4">
              {footerText}
            </Text>
          )}
          
          <Text className="text-gray-500 text-xs">
            You're receiving this email because you subscribed to our newsletter.{' '}
            <Link href={baseProps.unsubscribeUrl} className="text-primary-600 underline">
              Unsubscribe
            </Link>
          </Text>
        </Section>
      </Container>
    </BaseTemplate>
  );
};