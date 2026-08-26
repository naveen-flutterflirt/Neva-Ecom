import React from 'react';
import Hero from '../components/common/Hero';
import NewArrivals from '../components/product/NewArrivals';
import MarqueeSlide from '../components/product/slide';
import SocialProofStrip from '../components/product/SocialProofStrip';

export default function Home() {
  return (
    <main>
      <Hero />
      <NewArrivals />
      <MarqueeSlide />
      <SocialProofStrip />
    </main>
  );
}
