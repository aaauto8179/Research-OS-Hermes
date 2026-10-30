"use client";

import { CompanyTabs } from "@/components/CompanyTabs";

interface CompanyPageProps {
  params: Promise<{ symbol: string }>;
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { symbol } = await params;
  
  return (
    <div className="h-screen flex flex-col bg-background">
      <CompanyTabs symbol={symbol} />
    </div>
  );
}