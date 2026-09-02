'use client';

import type { WheatgrassDifferenceContent } from '../types';
import { defaultDifferenceContent } from '../data/defaults';
import { WHEATGRASS_LEAF, WHEATGRASS_INK } from '../constants';
import { CopyWithArtSection, CopyWithArtSectionSkeleton } from './copy-with-art-section';

interface Props {
  data?: WheatgrassDifferenceContent;
}

/**
 * Section 4 — "A DIFFERENCE YOU CAN SEE AND TASTE".
 * Pale leaf field with deep-forest ink, tilted bottle bleeding off the
 * bottom-right. Same layout as section 3, inverted palette.
 */
export function DifferenceSection({ data }: Props) {
  const { heading, paragraph, image } = data ?? defaultDifferenceContent;

  return (
    <CopyWithArtSection
      headingId="wheatgrass-difference-heading"
      heading={heading}
      paragraph={paragraph}
      image={image}
      backgroundColor={WHEATGRASS_LEAF}
      headingColor={WHEATGRASS_INK}
      bodyColor={WHEATGRASS_INK}
      artPosition="bottom"
    />
  );
}

export function DifferenceSectionSkeleton() {
  return <CopyWithArtSectionSkeleton backgroundColor={WHEATGRASS_LEAF} />;
}
