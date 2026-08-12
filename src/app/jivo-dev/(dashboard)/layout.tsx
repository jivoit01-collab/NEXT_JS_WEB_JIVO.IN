'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LivePreviewButton } from '@/components/shared/admin';
import { useTheme } from '@/providers/theme-provider';
import {
  Menu,
  X,
  LayoutDashboard,
  Home,
  Navigation,
  PanelBottom,
  Globe,
  Sparkles,
  Package,
  Newspaper,
  Users,
  BookOpen,
  Compass,
  Landmark,
  Factory,
  Scale,
  Leaf,
  Award,
  Film,
  ChevronDown,
  LogOut,
  ArrowLeft,
  Moon,
  Sun,
  ShieldAlert,
  Droplet,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────

interface NavChild {
  title: string;
  href: string;
  icon: React.ElementType;
  tab?: string;
}

interface NavSection {
  title: string;
  href: string;
  icon: React.ElementType;
  children: NavChild[];
}

// Every sidebar item is a section with a dropdown.
// Even if it has only one child, the UI stays consistent.

const SIDEBAR: NavSection[] = [
  {
    title: 'Dashboard',
    href: '/jivo-dev',
    icon: LayoutDashboard,
    children: [
      { title: 'Home Page', href: '/jivo-dev/home', icon: Home },
      { title: 'Navbar', href: '/jivo-dev/navbar', icon: Navigation },
      { title: 'Footer', href: '/jivo-dev/footer', icon: PanelBottom },
      { title: 'Login Security', href: '/jivo-dev/security', icon: ShieldAlert },
    ],
  },
  {
    title: 'Our Essence',
    href: '/jivo-dev/our-essence',
    icon: Sparkles,
    children: [
      { title: 'The Story', href: '/jivo-dev/our-essence-the-story', icon: BookOpen },
      { title: 'Core Values', href: '/jivo-dev/our-essence-core-values', icon: Compass },
      {
        title: 'Baru Sahib Association',
        href: '/jivo-dev/our-essence-baru-sahib-association',
        icon: Landmark,
      },
      {
        title: 'Milestones Timeline',
        href: '/jivo-dev/our-essence-milestones-timeline',
        icon: Film,
      },
      {
        title: 'Social Initiatives',
        href: '/jivo-dev/our-essence-social-initiatives',
        icon: Users,
      },
      {
        title: 'Our Fair Share',
        href: '/jivo-dev/our-essence-our-fair-share',
        icon: Scale,
      },
      {
        title: 'For Mother Earth',
        href: '/jivo-dev/our-essence-for-mother-earth',
        icon: Leaf,
      },
      {
        title: 'The Jivo Capital',
        href: '/jivo-dev/our-essence-the-jivo-capital',
        icon: Factory,
      },
      {
        title: 'Certifications & Quality Standards',
        href: '/jivo-dev/our-essence-certifications-quality-standards',
        icon: Award,
      },
    ],
  },
  {
    title: 'Our Products',
    href: '/jivo-dev/our-products',
    icon: Package,
    children: [
      { title: 'Canola Oils', href: '/jivo-dev/our-products/canola-oils', icon: Droplet },
      { title: 'Groundnut Oils', href: '/jivo-dev/our-products/groundnut-oils', icon: Droplet },
      { title: 'Mustard Oils', href: '/jivo-dev/our-products/mustard-oils', icon: Droplet },
      { title: 'Olive Oils', href: '/jivo-dev/our-products/olive-oils', icon: Droplet },
    ],
  },
  {
    title: 'Jivo Media',
    href: '/jivo-dev/media',
    icon: Newspaper,
    children: [],
  },
  {
    title: 'Community',
    href: '/jivo-dev/community',
    icon: Users,
    children: [],
  },
  {
    title: 'SEO Manager',
    href: '/jivo-dev/seo',
    icon: Globe,
    children: [
      { title: 'Home', href: '/jivo-dev/home', icon: Home, tab: 'seo' },
      { title: 'The Story', href: '/jivo-dev/our-essence-the-story', icon: BookOpen, tab: 'seo' },
      { title: 'Core Values', href: '/jivo-dev/our-essence-core-values', icon: Compass, tab: 'seo' },
      {
        title: 'Baru Sahib Association',
        href: '/jivo-dev/our-essence-baru-sahib-association',
        icon: Landmark,
        tab: 'seo',
      },
      {
        title: 'Milestones Timeline',
        href: '/jivo-dev/our-essence-milestones-timeline',
        icon: Film,
        tab: 'seo',
      },
      {
        title: 'Social Initiatives',
        href: '/jivo-dev/our-essence-social-initiatives',
        icon: Users,
        tab: 'seo',
      },
      {
        title: 'Our Fair Share',
        href: '/jivo-dev/our-essence-our-fair-share',
        icon: Scale,
        tab: 'seo',
      },
      {
        title: 'For Mother Earth',
        href: '/jivo-dev/our-essence-for-mother-earth',
        icon: Leaf,
        tab: 'seo',
      },
      {
        title: 'The Jivo Capital',
        href: '/jivo-dev/our-essence-the-jivo-capital',
        icon: Factory,
        tab: 'seo',
      },
      {
        title: 'Certifications & Quality Standards',
        href: '/jivo-dev/our-essence-certifications-quality-standards',
        icon: Award,
        tab: 'seo',
      },
      {
        title: 'Canola Oils',
        href: '/jivo-dev/our-products/canola-oils',
        icon: Droplet,
        tab: 'seo',
      },
      {
        title: 'Groundnut Oils',
        href: '/jivo-dev/our-products/groundnut-oils',
        icon: Droplet,
        tab: 'seo',
      },
      {
        title: 'Mustard Oils',
        href: '/jivo-dev/our-products/mustard-oils',
        icon: Droplet,
        tab: 'seo',
      },
      {
        title: 'Olive Oils',
        href: '/jivo-dev/our-products/olive-oils',
        icon: Droplet,
        tab: 'seo',
      },
    ],
  },
];

// ── Layout ───────────────────────────────────────────────────

/**
 * SERVER layout. It reads the analytics module registry HERE (server-side, where
 * the registration side effects safely run) and pre-renders each module's icon to
 * a node, handing the sidebar plain, serializable data to the client shell.
 *
 * Why: the sidebar/toolbar used to import the analytics service barrel from client
 * components, dragging its eager, lucide-laden registrations into the CLIENT bundle.
 * On analytics pages the same modules also load in the server graph, so Turbopack
 * served the client a server-compiled React — "more than one copy of React" — which
 * crashed every lucide icon. Feeding the client server-computed data removes that
 * dual-graph entirely.
 *
 * This file must therefore stay a Server Component: do NOT add `'use client'`.
 *
 * The sidebar nav itself lives in `dashboard-shell.tsx` and is derived from the
 * CMS registry (`@/modules/admin/cms`) — add a page there, not here.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const analyticsNav: AnalyticsNavLink[] = getAnalyticsSidebarModules().map((m) => {
    const Icon = m.icon;
    return {
      id: m.id,
      title: m.name,
      href: m.route,
      icon: <Icon size={14} />,
    };
  });

  return (
    <DashboardShell analyticsNav={analyticsNav} analyticsRoot={ANALYTICS_ROOT}>
      {children}
    </DashboardShell>
  );
}
