export { PrivacyPolicyMain, PrivacyHero, PrivacyBody } from './components';

export {
  getPrivacyPolicyPageSectionsAction,
  getAllPrivacyPolicySectionsAction,
  getPrivacyPolicySectionAction,
  upsertPrivacyPolicySectionAction,
  deletePrivacyPolicySectionAction,
} from './actions';

export {
  privacyHeroSchema,
  privacyBodySchema,
  privacyPolicySectionSchemas,
} from './validations';

export { defaultSeo, defaultHeroContent, defaultBodyContent } from './data/defaults';

export type {
  PrivacyHeroContent,
  PrivacyBodyContent,
  PrivacyBlock,
  PrivacyPolicySectionKey,
  PrivacyPolicySectionRow,
} from './types';
