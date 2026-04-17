'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import {
  Menu,
  X,
  LayoutDashboard,
  Home,
  Navigation,
  PanelBottom,
  Search,
  BookOpen,
  LogOut,
  ArrowLeft,
  Moon,
  Sun,
} from 'lucide-react';

// Only pages built so far. Add more as you build them.
const menuItems = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'Home Page', href: '/admin/home', icon: Home },
  { title: 'The Story', href: '/admin/our-essence-the-story', icon: BookOpen },
  { title: 'Navbar', href: '/admin/navbar', icon: Navigation },
  { title: 'Footer', href: '/admin/footer', icon: PanelBottom },
  { title: 'SEO', href: '/admin/seo', icon: Search },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        if (open) setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen bg-background">
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        ref={sidebarRef}
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-card shadow-sm',
          'transform transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-64',
          'md:translate-x-0',
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-6">
          <Link href="/" title="Back to Website">
            <ArrowLeft size={20} className="cursor-pointer hover:text-primary" />
          </Link>
          <span className="text-lg font-jost-bold">Admin Panel</span>
          <button
            onClick={() => setOpen(false)}
            className="cursor-pointer md:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
          <div className="hidden w-5 md:block" />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-jost-medium transition',
                isActive(item.href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground/80 hover:bg-accent hover:text-foreground',
              )}
            >
              <item.icon size={18} className="shrink-0" />
              <span className="truncate">{item.title}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t p-4 text-xs text-muted-foreground">
          <p>More pages will appear here as you build them.</p>
        </div>
      </aside>

      <div className="min-w-0 flex-1 md:ml-64">
        {/* Mobile topbar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:hidden">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setOpen(true)}
              className="cursor-pointer"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <h1 className="truncate text-sm font-jost-bold">Admin Panel</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9"
            >
              {mounted && theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Desktop topbar */}
        <header className="sticky top-0 z-20 hidden h-12 items-center justify-end gap-3 border-b bg-background/95 px-6 backdrop-blur md:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9"
          >
            {mounted && theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </header>

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
