import React from 'react';
import Hero from '../components/common/Hero';
import NewArrivals from '../components/product/NewArrivals';
import MarqueeSlide from '../components/product/slide';
import SocialProofStrip from '../components/product/SocialProofStrip';

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'NIVASHOP',
    url: 'https://nivashop.in',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://nivashop.in/products?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NIVASHOP',
    url: 'https://nivashop.in',
    logo: 'https://nivashop.in/logobgg.png',
    description: 'Premium 3D Printed Accessories & IoT Hardware',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bhopal',
      addressRegion: 'Madhya Pradesh',
      addressCountry: 'IN'
    }
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Hero />
      <NewArrivals />
      <MarqueeSlide />
      <SocialProofStrip />
    </main>
  );
}
