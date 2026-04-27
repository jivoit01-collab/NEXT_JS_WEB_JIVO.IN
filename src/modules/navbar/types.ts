export interface NavLinkItem {
  id: string;
  title: string;
  href?: string | null;
  sortOrder: number;
  isVisible: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface NavLinkInput {
  title: string;
  href?: string;
  sortOrder?: number;
  isVisible?: boolean;
}

export interface NavLinkUpdateInput {
  title?: string;
  href?: string;
  sortOrder?: number;
  isVisible?: boolean;
}

// ── Sub-links (dropdown items) ────────────────────────────────

export interface NavSubLinkItem {
  id: string;
  navLinkId: string;
  title: string;
  href: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface NavSubLinkInput {
  navLinkId: string;
  title: string;
  href: string;
  sortOrder?: number;
  isVisible?: boolean;
}

export interface NavSubLinkUpdateInput {
  navLinkId?: string;
  title?: string;
  href?: string;
  sortOrder?: number;
  isVisible?: boolean;
}

/** NavLink with its nested sub-links (used by public queries + admin) */
export interface NavLinkWithSubLinks extends NavLinkItem {
  subLinks: NavSubLinkItem[];
}

// ── Settings ──────────────────────────────────────────────────

export interface NavbarSettingItem {
  id: string;
  logoUrl: string | null;
  logoAlt: string | null;
  updatedAt: Date | string;
}

export interface NavbarSettingInput {
  logoUrl?: string | null;
  logoAlt?: string | null;
}
