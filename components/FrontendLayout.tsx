'use client';

import { ReactNode } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import AnnouncementBanner from './AnnouncementBanner';

interface FrontendLayoutProps {
  children: ReactNode;
}

export default function FrontendLayout({ children }: FrontendLayoutProps) {
  return (
    <>
      <Navigation />
      <AnnouncementBanner />
      {children}
      <Footer />
    </>
  );
}
