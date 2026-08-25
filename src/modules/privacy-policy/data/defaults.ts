import { definePageSeo } from '@/modules/seo';
import { SITE_URL } from '@/lib/constants';
import type { PrivacyHeroContent, PrivacyBodyContent } from '../types';

const PLACEHOLDER = '/api/uploads/placeholder.png';

export const defaultHeroContent: PrivacyHeroContent = {
  logoImage: PLACEHOLDER,
  heading: 'PRIVACY POLICY',
  intro:
    'Jivo Wellness Pvt. Ltd. respects & understands the importance of privacy and security for our users.',
  image: PLACEHOLDER,
};

export const defaultBodyContent: PrivacyBodyContent = {
  blocks: [
    {
      heading: '',
      body: 'Jivo Wellness Pvt. Ltd. will not sell, rent, or trade your personal information to any third party. Critical data transmitted to and from the site is encrypted with industry standard 128-bit encryption. Any Financial information is not available to the Jivo Wellness Pvt. Ltd. We do, however, can access personal information like address and phone numbers.\n\nUsers who supply us with personal information like telephone numbers or e-mail addresses may receive calls or emails regarding information on new programs, services, or upcoming events. The information will never be disclosed to a third party.\n\nIf at any point you no longer wish to receive information from Jivo Wellness Pvt. Ltd. you can e-mail us at info@lightcyan-wildcat-733997.hostingersite.com and we will remove you from our contact lists.',
    },
    {
      heading: 'EMBEDDED CONTENT FROM OTHER WEBSITES',
      body: 'Articles on this site may include embedded content (e.g. videos, images, articles, etc.). Embedded content from other websites behaves in the exact same way as if the visitor has visited the other website.\n\nThese websites may collect data about you, use cookies, embed additional third-party tracking, and monitor your interaction with that embedded content, including tracking your interaction with the embedded content if you have an account and are logged in to that website.',
    },
    {
      heading: 'WHO WE ARE',
      body: 'Our website address is: https://lightcyan-wildcat-733997.hostingersite.com.',
    },
    {
      heading: 'WHO WE SHARE YOUR DATA WITH',
      body: 'If you request a password reset, your IP address will be included in the reset email.',
    },
    {
      heading: 'COMMENTS',
      body: 'When visitors leave comments on the site we collect the data shown in the comments form, and also the visitor’s IP address and browser user agent string to help spam detection.\n\nAn anonymized string created from your email address (also called a hash) may be provided to the Gravatar service to see if you are using it. The Gravatar service privacy policy is available here: https://automattic.com/privacy/. After approval of your comment, your profile picture is visible to the public in the context of your comment.',
    },
    {
      heading: 'HOW LONG WE RETAIN YOUR DATA',
      body: 'If you leave a comment, the comment and its metadata are retained indefinitely. This is so we can recognize and approve any follow-up comments automatically instead of holding them in a moderation queue.\n\nFor users that register on our website (if any), we also store the personal information they provide in their user profile. All users can see, edit, or delete their personal information at any time (except they cannot change their username). Website administrators can also see and edit that information.',
    },
    {
      heading: 'MEDIA',
      body: 'If you upload images to the website, you should avoid uploading images with embedded location data (EXIF GPS) included. Visitors to the website can download and extract any location data from images on the website.',
    },
    {
      heading: 'WHAT RIGHTS YOU HAVE OVER YOUR DATA',
      body: 'If you have an account on this site, or have left comments, you can request to receive an exported file of the personal data we hold about you, including any data you have provided to us. You can also request that we erase any personal data we hold about you. This does not include any data we are obliged to keep for administrative, legal, or security purposes.',
    },
    {
      heading: 'COOKIES',
      body: 'If you leave a comment on our site you may opt-in to saving your name, email address and website in cookies. These are for your convenience so that you do not have to fill in your details again when you leave another comment. These cookies will last for one year.\n\nIf you visit our login page, we will set a temporary cookie to determine if your browser accepts cookies. This cookie contains no personal data and is discarded when you close your browser.\n\nWhen you log in, we will also set up several cookies to save your login information and your screen display choices. Login cookies last for two days, and screen options cookies last for a year. If you select “Remember Me”, your login will persist for two weeks. If you log out of your account, the login cookies will be removed.\n\nIf you edit or publish an article, an additional cookie will be saved in your browser. This cookie includes no personal data and simply indicates the post ID of the article you just edited. It expires after 1 day.',
    },
    {
      heading: 'WHERE WE SEND YOUR DATA',
      body: 'Visitor comments may be checked through an automated spam detection service.',
    },
  ],
};

export const defaultSeo = definePageSeo({
  metaTitle: 'Privacy Policy | Jivo Wellness',
  metaDescription:
    'How Jivo Wellness Pvt. Ltd. collects, uses, retains and protects your personal information, and the rights you have over your data.',
  keywords: ['jivo privacy policy', 'jivo wellness privacy', 'data protection', 'cookies policy'],
  ogTitle: 'Privacy Policy | Jivo Wellness',
  ogDescription:
    'Jivo Wellness respects and protects your privacy. Read how we handle your personal data.',
  ogImage: 'og-default.png',
  twitterCard: 'summary_large_image',
  canonicalUrl: `${SITE_URL}/privacy-policy`,
  robots: 'index,follow',
  structuredData: {
    '@type': 'WebPage',
    name: 'Privacy Policy',
    url: `${SITE_URL}/privacy-policy`,
  },
});
