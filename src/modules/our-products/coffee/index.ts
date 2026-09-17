// Components
export {
  CoffeeMain,
  CoffeeHero,
  RangeSection,
  KeyHighlightsSection,
  BeyondBeansSection,
} from './components';

// Server actions
export {
  getCoffeePageSectionsAction,
  getAllCoffeeSectionsAction,
  getCoffeeSectionAction,
  upsertCoffeeSectionAction,
  deleteCoffeeSectionAction,
  setCoffeeSectionActiveAction,
  reorderCoffeeSectionsAction,
} from './actions';

// Validations
export {
  coffeeHeroSchema,
  coffeeRangeSchema,
  coffeeKeyHighlightsSchema,
  coffeeBeyondBeansSchema,
  coffeeSectionSchemas,
} from './validations';

// Data
export {
  defaultSeo,
  defaultHeroContent,
  defaultRangeContent,
  defaultKeyHighlightsContent,
  defaultBeyondBeansContent,
} from './data/defaults';

// Types
export type {
  CoffeeHeroContent,
  CoffeeRangeContent,
  CoffeeKeyHighlightsContent,
  CoffeeBeyondBeansContent,
  CoffeeVariant,
  CoffeeSectionKey,
  CoffeeSectionRow,
} from './types';
