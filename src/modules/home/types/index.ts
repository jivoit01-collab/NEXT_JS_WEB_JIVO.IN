export interface ProductCategory {
  name: string;
  image: string;
  href: string;
  bgColor: string;
}

export interface ValuePillar {
  image: string;
  title: string;
  description: string;
}

// ---- Section Content Types ----

export interface HeroContent {
  logo: string;
  backgroundImage: string;
  headline: string;
  subtitle: string;
}

export interface CategoriesContent {
  heading: string;
  items: ProductCategory[];
}

export interface VisionMissionContent {
  backgroundImage: string;
  heading: string;
  subtitle: string;
  /** Optional longer intro paragraph that sits between the subtitle and the Vision/Mission columns. */
  intro?: string;
  vision: string;
  mission: string;
}

export interface ProductsFoundationContent {
  productImage: string;
  section1: { heading: string; paragraphs: string[] };
  section2: { heading: string; paragraphs: string[] };
}

export interface WhyJivoContent {
  heading: string;
  subheading: string;
  leftText: string;
  rightParagraphs: string[];
  valuePillars: ValuePillar[];
}

export type HomeSectionKey =
  | 'hero'
  | 'categories'
  | 'vision_mission'
  | 'products_foundation'
  | 'why_jivo';

// ---- Hero Carousel Slide ----

export interface HeroSlideData {
  id: string;
  backgroundImage: string;
  headline: string;
  subtitle: string;
  sortOrder: number;
  isActive: boolean;
}
