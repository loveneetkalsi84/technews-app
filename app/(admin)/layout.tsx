"use client";

import { ReactNode } from "react";
import { Providers } from "@/app/providers";
import AdminWrapper from "@/app/components/dashboard/AdminWrapper";

/**
 * Admin Layout for the TechNews dashboard
 * 
 * IMPORTANT: This layout already wraps all admin pages with the AdminWrapper component.
 * Do NOT add another AdminWrapper in individual page components, as this will cause
 * layout issues with duplicate sidebars and incorrect margins.
 * 
 * Example of correct page component (as TSX code):
 * 
 * export default function SomePage() {
 *   return (
 *     <div className="mx-auto max-w-7xl">
 *       // Your page content here
 *     </div>
 *   );
 * }
 */
export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Providers>
      <div className="admin-layout-debug">
        <AdminWrapper>
          {children}
        </AdminWrapper>
      </div>
    </Providers>
  );
}
