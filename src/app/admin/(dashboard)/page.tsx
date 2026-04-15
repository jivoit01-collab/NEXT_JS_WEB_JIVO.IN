import Link from 'next/link';
import { Home, LayoutDashboard, Search } from 'lucide-react';

const modules = [
  {
    label: 'Home Page',
    href: '/admin/home',
    icon: Home,
    description: 'Hero, categories, vision, why Jivo & more',
    ready: true,
  },
  {
    label: 'SEO',
    href: '/admin/seo',
    icon: Search,
    description: 'Per-page meta titles, descriptions, OG & JSON-LD',
    ready: true,
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl py-4 sm:py-8">
      <div className="mb-8 text-center sm:mb-12">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-gold sm:mb-4">
          Admin Dashboard
        </p>
        <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
          <span className="text-foreground">Welcome to</span>{' '}
          <span className="admin-gradient-text">Jivo Wellness</span>
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:mt-4 sm:text-base">
          Manage your website content from here. More modules will light up as you build them.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {modules.map((mod, index) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="group flex cursor-pointer flex-col items-center gap-3 rounded-xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 transition-colors group-hover:bg-primary/20">
              <mod.icon className="h-7 w-7 text-primary" />
            </div>
            <div className="text-center">
              <span className="text-sm font-medium text-foreground">{mod.label}</span>
              <p className="mt-1 text-xs text-muted-foreground">{mod.description}</p>
            </div>
          </Link>
        ))}

        {/* Placeholder slot showing more coming */}
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/30 p-6 text-center">
          <LayoutDashboard className="h-7 w-7 text-muted-foreground/60" />
          <span className="text-xs text-muted-foreground">
            More modules appear here as you build them
          </span>
        </div>
      </div>
    </div>
  );
}
