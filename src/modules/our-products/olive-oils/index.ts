// Components
export { OliveOilsMain, OliveOilsHero, VariantSection, DifferenceSection } from './components';

// Server actions
export {
  getOliveOilsPageSectionsAction,
  getAllOliveOilsSectionsAction,
  getOliveOilsSectionAction,
  upsertOliveOilsSectionAction,
  deleteOliveOilsSectionAction,
} from './actions';

// Validations
export {
  oliveOilsHeroSchema,
  oliveOilsVariantSchema,
  oliveOilsDifferenceSchema,
  oliveOilsSectionSchemas,
} from './validations';

// Data
export {
  defaultSeo,
  defaultHeroContent,
  defaultExtraVirginContent,
  defaultExtraLightContent,
  defaultPomaceContent,
  defaultDifferenceContent,
} from './data/defaults';

// Types
export type {
  OliveOilsHeroContent,
  OliveOilsVariantContent,
  OliveOilsDifferenceContent,
  OliveProductVariant,
  OliveOilsSectionKey,
  OliveOilsSectionRow,
} from './types';
