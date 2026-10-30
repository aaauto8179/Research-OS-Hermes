"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MOCK_COMPANIES } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Building2, Search } from "lucide-react";

export default function CompanyPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCompanies = MOCK_COMPANIES.filter(c =>
    c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      <div>
        <h1 className="text-2xl font-bold">Company Deep Dive</h1>
        <p className="text-sm text-muted-foreground">Select a company to view detailed analysis</p>
      </div>
      
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          placeholder="Search company by symbol or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.map(company => (
          <Card
            key={company.symbol}
            className="cursor-pointer hover:shadow-md transition-all"
            onClick={() => router.push(`/company/${company.symbol}`)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{company.symbol}</CardTitle>
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground truncate">{company.name}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-lg font-bold">₹{company.current_price.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">P/E: {company.pe}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
