import { WaterHero } from './hero-section';
import { RangeSection } from './range-section';
import { BetterBottleSection } from './better-bottle-section';
import { MissionSection } from './mission-section';
import type {
  WaterHeroContent,
  WaterRangeContent,
  WaterBetterBottleContent,
  WaterMissionContent,
} from '../types';

interface WaterMainProps {
  sections: Map<string, unknown>;
}

/**
 * Section order follows the approved design:
 *   1. Hero (bg photo)  2. Range  3. A Better Bottle  4. Our Mission (bg photo)
 *
 * Sections 1-3 mirror the canola page's styling; section 4 mirrors the
 * sunflower page's bg-image section. Only content and colours differ.
 */
export function WaterMain({ sections }: WaterMainProps) {
  return (
    <main>
      <WaterHero data={sections.get('hero') as WaterHeroContent | undefined} />
      <RangeSection data={sections.get('range') as WaterRangeContent | undefined} />
      <BetterBottleSection
        data={sections.get('betterBottle') as WaterBetterBottleContent | undefined}
      />
      <MissionSection data={sections.get('mission') as WaterMissionContent | undefined} />
    </main>
  );
}
