"use client";

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ConditionalHeader() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  
  // Only render the header for non-admin routes
  if (isAdminRoute) {
    return null;
  }
  
  return <Header />;
}
