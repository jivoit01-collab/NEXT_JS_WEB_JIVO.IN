// ⚠ This barrel is safe to import from BOTH server and client code.
// Server-only modules (data/queries, data/mutations, utils with prisma)
// are NOT re-exported here — import them directly when needed:
//
//   import { resolveSeo } from '@/modules/seo/utils';
//   import { getSeoByPage } from '@/modules/seo/data/queries';

// Components (client)
export { SeoTabPanel, SeoListTable } from './components';

// Server actions ('use server' files — Next.js bundles them correctly
// as RPC stubs in client code)
export {
  getSeoMetaAction,
  listAllSeoAction,
  updateSeoMetaAction,
  deleteSeoMetaAction,
} from './actions';

// Validations (pure)
export {
  seoFormSchema,
  seoSchema,
  twitterCardSchema,
  robotsSchema,
  type SeoFormSchema,
  type SeoSchema,
} from './validations';

// Defaults (pure data)
export { siteDefaultSeo, definePageSeo } from './data/defaults';

// Types
export type {
  SeoData,
  SeoFormInput,
  SeoDefaults,
  SeoListItem,
  TwitterCard,
  RobotsDirective,
} from './types';
