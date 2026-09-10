import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about NIVASHOP, our premium 3D printing services, custom filaments, and IoT hardware solutions based in Bhopal, India.',
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
