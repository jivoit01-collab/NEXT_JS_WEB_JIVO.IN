// ==========================================================================
// CMS page registry — the SINGLE SOURCE OF TRUTH for admin-managed pages.
//
// The admin sidebar, the SEO manager, AND the Analytics dashboard all derive
// their page lists from here. Add a CMS page ONCE and it appears everywhere
// (management nav, SEO, analytics) with no duplicate definitions.
// ==========================================================================

import {
  LayoutDashboard,
  Home,
  Navigation,
  PanelBottom,
  Sparkles,
  Package,
  Newspaper,
  Users,
  BookOpen,
  Compass,
  Landmark,
  Film,
  Scale,
  Leaf,
  Factory,
  Award,
} from 'lucide-react';
import type { CmsModule } from './types';

export const CMS_MODULES: CmsModule[] = [
  {
    id: 'site',
    name: 'Dashboard',
    icon: LayoutDashboard,
    adminHref: '/jivo-dev',
    order: 10,
    pages: [
      { id: 'home', name: 'Home Page', icon: Home, adminHref: '/jivo-dev/home', seo: true },
      { id: 'navbar', name: 'Navbar', icon: Navigation, adminHref: '/jivo-dev/navbar' },
      { id: 'footer', name: 'Footer', icon: PanelBottom, adminHref: '/jivo-dev/footer' },
    ],
  },
  {
    id: 'our-essence',
    name: 'Our Essence',
    icon: Sparkles,
    adminHref: '/jivo-dev/our-essence',
    order: 20,
    pages: [
      { id: 'the-story', name: 'The Story', icon: BookOpen, adminHref: '/jivo-dev/our-essence-the-story', seo: true },
      { id: 'core-values', name: 'Core Values', icon: Compass, adminHref: '/jivo-dev/our-essence-core-values', seo: true },
      { id: 'baru-sahib-association', name: 'Baru Sahib Association', icon: Landmark, adminHref: '/jivo-dev/our-essence-baru-sahib-association', seo: true },
      { id: 'milestones-timeline', name: 'Milestones Timeline', icon: Film, adminHref: '/jivo-dev/our-essence-milestones-timeline', seo: true },
      { id: 'social-initiatives', name: 'Social Initiatives', icon: Users, adminHref: '/jivo-dev/our-essence-social-initiatives', seo: true },
      { id: 'our-fair-share', name: 'Our Fair Share', icon: Scale, adminHref: '/jivo-dev/our-essence-our-fair-share', seo: true },
      { id: 'for-mother-earth', name: 'For Mother Earth', icon: Leaf, adminHref: '/jivo-dev/our-essence-for-mother-earth', seo: true },
      { id: 'the-jivo-capital', name: 'The Jivo Capital', icon: Factory, adminHref: '/jivo-dev/our-essence-the-jivo-capital', seo: true },
      { id: 'certifications-quality-standards', name: 'Certifications & Quality Standards', icon: Award, adminHref: '/jivo-dev/our-essence-certifications-quality-standards', seo: true },
    ],
  },
  {
    id: 'products',
    name: 'Our Products',
    icon: Package,
    adminHref: '/jivo-dev/our-products',
    order: 30,
    pages: [],
  },
  {
    id: 'media',
    name: 'Jivo Media',
    icon: Newspaper,
    adminHref: '/jivo-dev/media',
    order: 40,
    pages: [],
  },
  {
    id: 'community',
    name: 'Community',
    icon: Users,
    adminHref: '/jivo-dev/community',
    order: 50,
    pages: [],
  },
];
