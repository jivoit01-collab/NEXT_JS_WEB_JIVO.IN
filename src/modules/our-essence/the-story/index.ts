// Components
export { TheStoryMain, TheStoryHero, FounderSection, VisionSection } from './components';

// Server actions
export {
  getTheStoryPageSectionsAction,
  getAllTheStorySectionsAction,
  getTheStorySectionAction,
  upsertTheStorySectionAction,
  deleteTheStorySectionAction,
} from './actions';

// Validations
export {
  theStoryHeroSchema,
  theStoryFounderSchema,
  theStoryVisionSchema,
  theStorySectionSchemas,
} from './validations';

// Data
export {
  defaultSeo,
  defaultHeroContent,
  defaultFounderContent,
  defaultVisionContent,
} from './data/defaults';

// Types
export type {
  TheStoryHeroContent,
  TheStoryFounderContent,
  TheStoryVisionContent,
  TheStorySectionKey,
  TheStorySectionRow,
} from './types';
