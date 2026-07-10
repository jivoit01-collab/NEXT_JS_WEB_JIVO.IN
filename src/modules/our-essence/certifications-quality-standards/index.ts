// Components
export {
  CertificationsMain,
  CertificationsHero,
  BadgesGridSection,
  FeaturedBadgeSection,
} from './components';

// Server actions
export {
  getCertificationsPageSectionsAction,
  getAllCertificationsSectionsAction,
  getCertificationsSectionAction,
  upsertCertificationsSectionAction,
  deleteCertificationsSectionAction,
} from './actions';

// Validations
export {
  certificationsHeroSchema,
  certificationsBadgesSchema,
  certificationsFeaturedSchema,
  certificationsSectionSchemas,
} from './validations';

// Data
export {
  defaultSeo,
  defaultHeroContent,
  defaultBadgesContent,
  defaultFeaturedContent,
} from './data/defaults';

// Types
export type {
  CertificationsHeroContent,
  CertificationsBadgesContent,
  CertificationsFeaturedContent,
  CertificationBadge,
  CertificationsSectionKey,
  CertificationsSectionRow,
} from './types';
