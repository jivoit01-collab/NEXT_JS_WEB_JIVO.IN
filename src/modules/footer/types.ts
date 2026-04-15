import type { FooterColumn, FooterLink, FooterSetting } from '@prisma/client';

export type FooterColumnRow = FooterColumn;
export type FooterLinkRow = FooterLink;
export type FooterSettingRow = FooterSetting;

/** Column + its links, joined — returned by getVisibleFooter() */
export interface FooterColumnWithLinks extends FooterColumn {
  links: FooterLink[];
}

/** Everything the public footer needs in one shot */
export interface FooterData {
  columns: FooterColumnWithLinks[];
  setting: FooterSetting;
}
