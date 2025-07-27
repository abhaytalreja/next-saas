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

export interface ProductFeature {
  icon?: string;
  title: string;
  description: string;
}

export interface ProductLaunchTemplateProps extends Omit<BaseTemplateProps, 'children'> {
  productName: string;
  productDescription: string;
  heroImageUrl?: string;
  features: ProductFeature[];
  launchDate?: string;
  ctaText: string;
  ctaUrl: string;
  pricingText?: string;
  pricingUrl?: string;
}

export const ProductLaunchTemplate: React.FC<ProductLaunchTemplateProps> = ({
  productName,
  productDescription,
  heroImageUrl,
  features,
  launchDate,
  ctaText,
  ctaUrl,
  pricingText,
  pricingUrl,
  ...baseProps
}) => {
  return (
    <BaseTemplate {...baseProps}>
      <Container className="mx-auto max-w-2xl bg-white">
        {/* Hero Section */}
        <Section className="text-center px-6 py-8">
          {heroImageUrl && (
            <Img
              src={heroImageUrl}
              alt={productName}
              className="w-full max-w-md mx-auto mb-6 rounded-lg"
            />
          )}
          
          <Heading className="text-3xl font-bold text-gray-900 mb-4">
            Introducing {productName}
          </Heading>
          
          <Text className="text-lg text-gray-600 mb-6 leading-relaxed">
            {productDescription}
          </Text>
          
          {launchDate && (
            <Section className="bg-primary-50 rounded-lg p-4 mb-6">
              <Text className="text-primary-600 font-semibold text-sm uppercase tracking-wide">
                Available Now
              </Text>
              <Text className="text-gray-700 text-sm">
                Launched on {launchDate}
              </Text>
            </Section>
          )}
          
          <Button
            href={ctaUrl}
            className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors inline-block"
          >
            {ctaText}
          </Button>
        </Section>

        <Hr className="border-gray-200 my-8" />

        {/* Features Section */}
        <Section className="px-6 py-8">
          <Heading className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Key Features
          </Heading>
          
          {features.map((feature, index) => (
            <Section key={index} className="mb-6">
              <Section className="flex items-start space-x-4">
                {feature.icon && (
                  <Img
                    src={feature.icon}
                    alt=""
                    className="w-8 h-8 mt-1 flex-shrink-0"
                  />
                )}
                <Section className="flex-1">
                  <Heading className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </Heading>
                  <Text className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </Text>
                </Section>
              </Section>
            </Section>
          ))}
        </Section>

        <Hr className="border-gray-200 my-8" />

        {/* CTA Section */}
        <Section className="bg-gray-50 px-6 py-8 text-center rounded-lg mx-6">
          <Heading className="text-xl font-bold text-gray-900 mb-3">
            Ready to get started?
          </Heading>
          
          <Text className="text-gray-600 mb-6">
            Join thousands of users who are already using {productName}
          </Text>
          
          <Button
            href={ctaUrl}
            className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors inline-block mb-4"
          >
            {ctaText}
          </Button>
          
          {pricingText && pricingUrl && (
            <Section>
              <Link
                href={pricingUrl}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                {pricingText}
              </Link>
            </Section>
          )}
        </Section>

        {/* Footer */}
        <Section className="px-6 py-6 text-center">
          <Text className="text-gray-500 text-xs">
            You're receiving this email because you subscribed to product updates.{' '}
            <Link href={baseProps.unsubscribeUrl} className="text-primary-600 underline">
              Unsubscribe
            </Link>
          </Text>
        </Section>
      </Container>
    </BaseTemplate>
  );
};