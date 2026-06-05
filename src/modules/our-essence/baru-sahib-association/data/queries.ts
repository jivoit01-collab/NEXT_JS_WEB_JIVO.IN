import { cache } from 'react';
import { existsSync } from 'fs';
import path from 'path';
import { prisma } from '@/lib/db';
import { heroSectionData, humanitySectionData, pageContentKey } from '../content-defaults';
import type { BaruSahibAssociationSectionKey } from '../types';

const UPLOAD_IMAGE_DIR = path.join(process.cwd(), 'uploads', 'images');
const PLACEHOLDER_PATH = path.join(process.cwd(), 'uploads', 'placeholder.png');

function getUploadFilename(value: string) {
  if (!value || value === 'placeholder.png') return '';
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
    return '';
  }

  if (value.startsWith('/api/uploads/')) {
    return decodeURIComponent(value.split('/api/uploads/')[1]?.split('?')[0] ?? '');
  }

  if (value.startsWith('/')) {
    return '';
  }

  return value;
}

function isAvailableUploadImage(value: string | undefined) {
  if (!value) return false;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
    return true;
  }

  const filename = getUploadFilename(value);
  if (!filename) return value !== 'placeholder.png' && value.startsWith('/');

  if (filename === 'placeholder.png') return existsSync(PLACEHOLDER_PATH);
  return existsSync(path.join(UPLOAD_IMAGE_DIR, filename));
}

function normalizePublicSectionContent(section: string, content: unknown) {
  if (section === 'hero' && content && typeof content === 'object') {
    const heroContent = content as typeof heroSectionData;
    return {
      ...heroContent,
      image: isAvailableUploadImage(heroContent.image) ? heroContent.image : heroSectionData.image,
    };
  }

  if (section === 'humanity' && content && typeof content === 'object') {
    const humanityContent = content as typeof humanitySectionData;
    return {
      ...humanityContent,
      image: isAvailableUploadImage(humanityContent.image)
        ? humanityContent.image
        : humanitySectionData.image,
    };
  }

  return content;
}

export const getBaruSahibAssociationSections = cache(async () => {
  const sections = await prisma.pageContent.findMany({
    where: { page: pageContentKey, isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { section: true, content: true },
  });

  return sections.map((section) => ({
    ...section,
    content: normalizePublicSectionContent(section.section, section.content),
  }));
});

export async function getAllBaruSahibAssociationSections() {
  return prisma.pageContent.findMany({
    where: { page: pageContentKey },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getBaruSahibAssociationSection(section: BaruSahibAssociationSectionKey) {
  return prisma.pageContent.findUnique({
    where: { page_section: { page: pageContentKey, section } },
  });
}
