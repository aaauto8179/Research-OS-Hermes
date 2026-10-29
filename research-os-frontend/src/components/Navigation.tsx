"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Search, Building2, Briefcase, 
  BarChart2, Target, FileText, Kanban, TrendingUp,
  Settings, Menu, X, ChevronRight, Zap, Calculator,
  Lightbulb, Eye, Layers, ClipboardList
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Macro", href: "/macro", icon: TrendingUp },
  { name: "Generate Ideas", href: "/screening", icon: Lightbulb },
  { name: "Watchlist", href: "/watchlist", icon: Eye },
  { name: "Industry", href: "/industry", icon: Building2 },
  { name: "Company Deep Dive", href: "/company", icon: Building2 },
  { name: "Valuation", href: "/valuation", icon: Calculator },
  { name: "Weigh Decisions", href: "/weigh", icon: Target },
  { name: "Portfolio", href: "/portfolio", icon: Briefcase },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "GRWTH Pipeline", href: "/grwth", icon: Layers },
  { name: "Tasks & Time", href: "/tasks", icon: ClipboardList },
];

export default function Navigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 transition-all duration-300 bg-card border-r",
        sidebarOpen ? "w-64" : "w-16",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className={cn("flex items-center justify-between h-16 px-4 border-b", !sidebarOpen && "justify-center")}>
            {sidebarOpen && (
              <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                <Zap className="h-6 w-6 text-primary" />
                <span>Research OS</span>
              </Link>
            )}
            {!sidebarOpen && (
              <Link href="/" className="p-2" title="Research OS">
                <Zap className="h-6 w-6 text-primary" />
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", sidebarOpen ? "ml-auto" : "mx-auto")}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <ChevronRight className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Main navigation">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    !sidebarOpen && "justify-center px-2"
                  )}
                  title={sidebarOpen ? undefined : item.name}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {sidebarOpen && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className={cn("p-3 border-t", !sidebarOpen && "hidden")}>
            <Link href="/settings" className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden" 
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content */}
      <main className={cn("flex-1 flex flex-col min-w-0", sidebarOpen ? "lg:pl-64" : "lg:pl-16")}>
        {/* Mobile header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-20 h-16 bg-card border-b flex items-center justify-between px-4">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="font-bold text-lg">Research OS</h1>
          <div className="w-10" />
        </div>

        <div className="flex-1 pt-4 lg:pt-0 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}