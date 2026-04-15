export interface NavLinkItem {
  id: string;
  title: string;
  href: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface NavLinkInput {
  title: string;
  href: string;
  sortOrder?: number;
  isVisible?: boolean;
}

export interface NavLinkUpdateInput {
  title?: string;
  href?: string;
  sortOrder?: number;
  isVisible?: boolean;
}

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
