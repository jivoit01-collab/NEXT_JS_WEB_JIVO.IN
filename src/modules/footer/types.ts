import type { FooterColumn, FooterLink, FooterSetting } from '@prisma/client';

export type FooterColumnRow = FooterColumn;
export type FooterLinkRow = FooterLink;
export type FooterSettingRow = FooterSetting;

/** Column + its links, joined — returned by getVisibleFooter() */
export interface FooterColumnWithLinks extends FooterColumn {
  links: FooterLink[];
}

export type VisibleFooterColumnWithLinks = Pick<FooterColumn, 'id' | 'title'> & {
  links: Pick<FooterLink, 'id' | 'title' | 'href'>[];
};

export type VisibleFooterSetting = Pick<
  FooterSetting,
  'logoUrl' | 'logoAlt' | 'copyrightText' | 'address' | 'email' | 'phone' | 'phoneLabel'
>;

/** Everything the public footer needs in one shot */
export interface FooterData {
  columns: VisibleFooterColumnWithLinks[];
  setting: VisibleFooterSetting;
}
