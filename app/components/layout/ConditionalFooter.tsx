"use client";

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  
  // Only render the footer for non-admin routes
  if (isAdminRoute) {
    return null;
  }
  
  return <Footer />;
}
