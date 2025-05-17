"use client";

import { ReactNode } from "react";
import { Providers } from "@/app/providers";
import AdminWrapper from "@/app/components/dashboard/AdminWrapper";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Providers>
      <AdminWrapper>
        {children}
      </AdminWrapper>
    </Providers>
  );
}
