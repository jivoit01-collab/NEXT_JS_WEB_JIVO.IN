export {
  RefinedGoldOilsMain,
  RefinedGoldOilsHero,
  RangeSection,
  HighlightsSection,
  WhatIsGoldSection,
} from './components';

export {
  getRefinedGoldOilsPageSectionsAction,
  getAllRefinedGoldOilsSectionsAction,
  getRefinedGoldOilsSectionAction,
  upsertRefinedGoldOilsSectionAction,
  deleteRefinedGoldOilsSectionAction,
} from './actions';

export {
  refinedGoldOilsHeroSchema,
  refinedGoldOilsRangeSchema,
  refinedGoldOilsHighlightsSchema,
  refinedGoldOilsWhatIsSchema,
  refinedGoldOilsSectionSchemas,
} from './validations';

export {
  defaultSeo,
  defaultHeroContent,
  defaultRangeContent,
  defaultHighlightsContent,
  defaultWhatIsContent,
} from './data/defaults';

export type {
  RefinedGoldOilsHeroContent,
  RefinedGoldOilsRangeContent,
  RefinedGoldOilsHighlightsContent,
  RefinedGoldOilsWhatIsContent,
  RefinedGoldProductVariant,
  RefinedGoldOilsSectionKey,
  RefinedGoldOilsSectionRow,
} from './types';
