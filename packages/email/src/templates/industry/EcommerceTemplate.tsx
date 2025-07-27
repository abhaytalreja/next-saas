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

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  productUrl: string;
  category?: string;
}

export interface EcommerceTemplateProps extends Omit<BaseTemplateProps, 'children'> {
  emailType: 'promotion' | 'new_arrivals' | 'abandoned_cart' | 'recommendation';
  title: string;
  subtitle?: string;
  products: Product[];
  promoCode?: string;
  promoDiscount?: string;
  ctaText: string;
  ctaUrl: string;
  expiryDate?: string;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const EcommerceTemplate: React.FC<EcommerceTemplateProps> = ({
  emailType,
  title,
  subtitle,
  products,
  promoCode,
  promoDiscount,
  ctaText,
  ctaUrl,
  expiryDate,
  ...baseProps
}) => {
  const getEmailTypeColor = () => {
    switch (emailType) {
      case 'promotion':
        return 'bg-red-600';
      case 'new_arrivals':
        return 'bg-green-600';
      case 'abandoned_cart':
        return 'bg-orange-600';
      case 'recommendation':
        return 'bg-blue-600';
      default:
        return 'bg-primary-600';
    }
  };

  return (
    <BaseTemplate {...baseProps}>
      <Container className="mx-auto max-w-2xl bg-white">
        {/* Header */}
        <Section className={`${getEmailTypeColor()} px-6 py-8 text-center`}>
          <Heading className="text-2xl font-bold text-white mb-2">
            {title}
          </Heading>
          {subtitle && (
            <Text className="text-white/90 text-sm">
              {subtitle}
            </Text>
          )}
        </Section>

        {/* Promo Code Banner */}
        {promoCode && promoDiscount && (
          <Section className="bg-yellow-50 border-2 border-yellow-200 mx-6 mt-6 rounded-lg p-4 text-center">
            <Text className="text-yellow-800 font-semibold text-sm uppercase tracking-wide mb-1">
              Special Offer
            </Text>
            <Text className="text-lg font-bold text-yellow-900 mb-2">
              {promoDiscount} OFF with code
            </Text>
            <Text className="bg-yellow-200 text-yellow-900 px-3 py-1 rounded font-mono font-bold text-lg">
              {promoCode}
            </Text>
            {expiryDate && (
              <Text className="text-yellow-700 text-xs mt-2">
                Expires {expiryDate}
              </Text>
            )}
          </Section>
        )}

        {/* Products Grid */}
        <Section className="px-6 py-8">
          <Section className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <Section key={product.id} className="border border-gray-200 rounded-lg p-4">
                <Img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                
                {product.category && (
                  <Text className="text-xs uppercase font-semibold text-gray-500 mb-1 tracking-wide">
                    {product.category}
                  </Text>
                )}
                
                <Heading className="text-sm font-semibold text-gray-900 mb-2 leading-tight">
                  {product.name}
                </Heading>
                
                <Text className="text-xs text-gray-600 mb-3 leading-relaxed">
                  {product.description}
                </Text>
                
                <Section className="flex items-center justify-between">
                  <Section className="flex items-center space-x-2">
                    <Text className="text-lg font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </Text>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <Text className="text-sm text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </Text>
                    )}
                  </Section>
                </Section>
                
                <Button
                  href={product.productUrl}
                  className="w-full mt-3 bg-gray-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  View Product
                </Button>
              </Section>
            ))}
          </Section>
        </Section>

        {/* CTA Section */}
        <Section className="bg-gray-50 px-6 py-8 text-center rounded-lg mx-6 mb-6">
          <Heading className="text-xl font-bold text-gray-900 mb-3">
            {emailType === 'abandoned_cart' ? "Don't miss out!" : 'Shop Now'}
          </Heading>
          
          <Text className="text-gray-600 mb-6">
            {emailType === 'abandoned_cart' 
              ? 'Complete your purchase before these items are gone!'
              : 'Discover our full collection and find your perfect match'
            }
          </Text>
          
          <Button
            href={ctaUrl}
            className={`${getEmailTypeColor()} text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity inline-block`}
          >
            {ctaText}
          </Button>
          
          {promoCode && (
            <Text className="text-sm text-gray-600 mt-3">
              Use code <span className="font-mono font-bold">{promoCode}</span> at checkout
            </Text>
          )}
        </Section>

        {/* Trust Indicators */}
        <Section className="px-6 py-6 bg-gray-50 text-center">
          <Section className="flex justify-center items-center space-x-6 text-sm text-gray-600">
            <Section className="flex items-center space-x-2">
              <Text>🚚</Text>
              <Text>Free Shipping</Text>
            </Section>
            <Section className="flex items-center space-x-2">
              <Text>↩️</Text>
              <Text>Easy Returns</Text>
            </Section>
            <Section className="flex items-center space-x-2">
              <Text>🔒</Text>
              <Text>Secure Checkout</Text>
            </Section>
          </Section>
        </Section>

        {/* Footer */}
        <Section className="px-6 py-6 text-center">
          <Text className="text-gray-500 text-xs">
            You're receiving this email because you subscribed to our product updates.{' '}
            <Link href={baseProps.unsubscribeUrl} className="text-primary-600 underline">
              Unsubscribe
            </Link>
          </Text>
        </Section>
      </Container>
    </BaseTemplate>
  );
};