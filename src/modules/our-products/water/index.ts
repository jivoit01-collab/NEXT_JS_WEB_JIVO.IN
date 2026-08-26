export {
  WaterMain,
  WaterHero,
  RangeSection,
  BetterBottleSection,
  MissionSection,
} from './components';

export {
  getWaterPageSectionsAction,
  getAllWaterSectionsAction,
  getWaterSectionAction,
  upsertWaterSectionAction,
  deleteWaterSectionAction,
} from './actions';

export {
  waterHeroSchema,
  waterRangeSchema,
  waterBetterBottleSchema,
  waterMissionSchema,
  waterSectionSchemas,
} from './validations';

export {
  defaultSeo,
  defaultHeroContent,
  defaultRangeContent,
  defaultBetterBottleContent,
  defaultMissionContent,
} from './data/defaults';

export type {
  WaterHeroContent,
  WaterRangeContent,
  WaterBetterBottleContent,
  WaterMissionContent,
  WaterVariant,
  WaterFeature,
  WaterSectionKey,
  WaterSectionRow,
} from './types';
