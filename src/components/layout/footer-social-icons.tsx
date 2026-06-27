import type { IconType } from 'react-icons';
import { FaInstagram, FaFacebookF, FaYoutube, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import { cn } from '@/lib/utils';
import type { SocialPlatform } from '@/modules/footer';
import type { VisibleFooterSocialLink } from '@/modules/footer/types';

/**
 * Real brand-icon registry. Adding a new platform is one line here (plus the
 * matching entry in `SOCIAL_PLATFORMS` in the footer validations).
 */
export const SOCIAL_ICONS: Record<SocialPlatform, { Icon: IconType; label: string }> = {
  instagram: { Icon: FaInstagram, label: 'Instagram' },
  facebook: { Icon: FaFacebookF, label: 'Facebook' },
  youtube: { Icon: FaYoutube, label: 'YouTube' },
  linkedin: { Icon: FaLinkedinIn, label: 'LinkedIn' },
  x: { Icon: FaXTwitter, label: 'X' },
};

export function getSocialIcon(platform: string) {
  return SOCIAL_ICONS[platform as SocialPlatform] ?? null;
}

interface FooterSocialIconsProps {
  socials: VisibleFooterSocialLink[];
  className?: string;
}

/** Row of circular, outlined brand-icon links. Hover effects gated to `hover: hover`. */
export function FooterSocialIcons({ socials, className }: FooterSocialIconsProps) {
  if (socials.length === 0) return null;

  return (
    <ul className={cn('flex flex-wrap items-center gap-2.5 sm:gap-3', className)}>
      {socials.map((social) => {
        const entry = getSocialIcon(social.platform);
        if (!entry) return null;
        const { Icon, label } = entry;

        return (
          <li key={social.id}>
            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#3a3a3a] text-[#9b9b9b] transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-[#43a86c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] focus-visible:outline-none [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:border-[#43a86c] [@media(hover:hover)]:hover:bg-[#43a86c] [@media(hover:hover)]:hover:text-white sm:h-10 sm:w-10"
            >
              <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
