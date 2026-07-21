import type {
  FooterColumn,
  FooterLink,
  FooterSetting,
  FooterSocialLink,
  FooterCertificate,
} from '@prisma/client';

export type FooterColumnRow = FooterColumn;
export type FooterLinkRow = FooterLink;
export type FooterSettingRow = FooterSetting;
export type FooterSocialLinkRow = FooterSocialLink;
export type FooterCertificateRow = FooterCertificate;

/** Column + its links, joined — returned by getVisibleFooter() */
export interface FooterColumnWithLinks extends FooterColumn {
  links: FooterLink[];
}

export type VisibleFooterColumnWithLinks = Pick<FooterColumn, 'id' | 'title'> & {
  links: Pick<FooterLink, 'id' | 'title' | 'href'>[];
};

export type VisibleFooterSetting = Pick<
  FooterSetting,
  | 'logoUrl'
  | 'logoAlt'
  | 'copyrightText'
  | 'address'
  | 'addressMapUrl'
  | 'email'
  | 'phone'
  | 'phoneLabel'
  | 'tagline'
  | 'brandPromise'
  | 'brandPromiseSub'
  | 'ctaLabel'
  | 'ctaHref'
  | 'leafImageTop'
  | 'leafImageBottom'
  | 'followLabel'
  | 'certificationText'
  | 'madeInText'
>;

export type VisibleFooterSocialLink = Pick<FooterSocialLink, 'id' | 'platform' | 'url'>;

export type VisibleFooterCertificate = Pick<FooterCertificate, 'id' | 'imageUrl' | 'alt'>;

/** Everything the public footer needs in one shot */
export interface FooterData {
  columns: VisibleFooterColumnWithLinks[];
  setting: VisibleFooterSetting;
  socials: VisibleFooterSocialLink[];
  certificates: VisibleFooterCertificate[];
}
