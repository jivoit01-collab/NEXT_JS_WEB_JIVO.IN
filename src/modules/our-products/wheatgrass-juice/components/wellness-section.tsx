'use client';

import type { WheatgrassWellnessContent } from '../types';
import { defaultWellnessContent } from '../data/defaults';
import { WHEATGRASS_FOREST, WHEATGRASS_CREAM } from '../constants';
import { CopyWithArtSection, CopyWithArtSectionSkeleton } from './copy-with-art-section';

interface Props {
  data?: WheatgrassWellnessContent;
}

/**
 * Section 3 — "MORE THAN A JUICE: A CARRIER OF WELLNESS".
 * Deep forest field, white copy, wheatgrass blades bleeding off the right.
 */
export function WellnessSection({ data }: Props) {
  const { heading, paragraph, image } = data ?? defaultWellnessContent;

  return (
    <CopyWithArtSection
      headingId="wheatgrass-wellness-heading"
      heading={heading}
      paragraph={paragraph}
      image={image}
      backgroundColor={WHEATGRASS_FOREST}
      headingColor={WHEATGRASS_CREAM}
      bodyColor={WHEATGRASS_CREAM}
      // ── BLADES TUNING ──────────────────────────────────────────
      artTuning={{
        // The art is a single UPRIGHT bunch; a negative tilt lays it on the
        // diagonal so the blades sweep up-left, roots toward the lower right.
        tilt: -72,
        // offsetX -> CSS `right`: POSITIVE pulls the art INWARD (more of it
        // visible), NEGATIVE pushes it off the edge where overflow-hidden
        // clips it. Rotation makes the visible shape far wider than its box,
        // so a positive value is what keeps the whole fan on-screen.
        // offsetY -> CSS `bottom`: POSITIVE lifts it UP, NEGATIVE drops it
        // below the section edge.
        offsetX: '-12%',
        // Scales WITH the art (same clamp curve as `width`), so the art keeps
        // an identical 0.64x offset-to-size ratio on every screen. A fixed
        // 14rem stayed 224px while the art shrank, so on mobile it was pushed
        // down ~2x further relative to its own size. Peak value is still 14rem,
        // so the desktop look is unchanged.
        offsetY: 'clamp(7rem, 19.09vw, 18rem)',
        width: 'clamp(11rem, 30vw, 26rem)',
      }}
    />
  );
}

export function WellnessSectionSkeleton() {
  return <CopyWithArtSectionSkeleton backgroundColor={WHEATGRASS_FOREST} />;
}
