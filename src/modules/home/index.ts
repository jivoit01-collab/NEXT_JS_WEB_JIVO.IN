// Components
export { HomeMain } from './components/home-main';
export { HeroSection } from './components/hero-section';
export { ProductCategories } from './components/product-categories';
export { VisionMission } from './components/vision-mission';
export { ProductsFoundation } from './components/products-foundation';
export { WhyJivo } from './components/why-jivo';

// Server Actions
export {
  getHomePageSections,
  getAllHomePageSections,
  getHomePageSection,
  createHomePageSection,
  updateHomePageSection,
  upsertHomePageSection,
  deleteHomePageSection,
  getActiveHeroSlides,
  getAllHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  reorderHeroSlides,
} from './actions';

// Validations
export {
  heroContentSchema,
  categoriesContentSchema,
  visionMissionContentSchema,
  productsFoundationContentSchema,
  whyJivoContentSchema,
  homeSectionSchema,
  homeSectionUpdateSchema,
  sectionContentSchemas,
} from './validations';

// Default content (also used as seed data)
export {
  heroContent,
  defaultHeroSlides,
  productCategories,
  visionMissionContent,
  productsFoundationContent,
  whyJivoContent,
  valuePillars,
} from './data/home-content';

// SEO defaults — used by generateMetadata in (public)/home/page-content.tsx
export { defaultSeo } from './data/defaults';

// Types
export type {
  ProductCategory,
  ValuePillar,
  HeroContent,
  CategoriesContent,
  VisionMissionContent,
  ProductsFoundationContent,
  WhyJivoContent,
  HomeSectionKey,
  HeroSlideData,
} from './types';
