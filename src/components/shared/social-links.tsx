import Link from 'next/link';

const socialLinks = [
  { label: 'Facebook', href: 'https://www.facebook.com/JivoWellness', icon: 'FB' },
  { label: 'Instagram', href: 'https://www.instagram.com/jivowellness', icon: 'IG' },
  { label: 'YouTube', href: 'https://www.youtube.com/@jivowellness', icon: 'YT' },
];

export function SocialLinks() {
  return (
    <div className="flex items-center gap-4">
      {socialLinks.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
          aria-label={link.label}
        >
          {link.icon}
        </Link>
      ))}
    </div>
  );
}
