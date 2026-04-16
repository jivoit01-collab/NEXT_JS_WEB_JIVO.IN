'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  whyJivoContent as textDefaults,
  valuePillars as pillarDefaults,
} from '../data/home-content';
import { toSrc } from '@/components/shared/image-upload';
import type { WhyJivoContent } from '../types';

interface WhyJivoProps {
  data?: WhyJivoContent;
}

const PLACEHOLDER = '/api/uploads/placeholder.png';

export function WhyJivo({ data }: WhyJivoProps) {
  const content = data
    ? {
        heading: data.heading,
        subheading: data.subheading,
        leftText: data.leftText,
        rightParagraphs: data.rightParagraphs,
      }
    : textDefaults;
  const pillars = data?.valuePillars ?? pillarDefaults;

  return (
    <section
      className="font-sans px-4 py-20 md:py-28"
      style={{ backgroundColor: '#1f5437', color: '#ffffff' }}
    >
      <div className="container mx-auto max-w-6xl">
        {/* Top — Two-column text */}
        <div className="mb-24 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-20">
          {/* Left column */}
          <div>
            <h2
              className="font-sans font-extrabold uppercase leading-[1.05] tracking-tight"
              style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}
            >
              {content.heading}
            </h2>
            <p
              className="mt-4 text-base font-normal md:text-lg"
              style={{ color: '#ffffff' }}
            >
              {content.subheading}
            </p>
            <p
              className="mt-8 text-[15px] italic leading-relaxed md:text-base"
              style={{ color: '#ffffff' }}
            >
              {content.leftText}
            </p>
          </div>

          {/* Right column — paragraphs */}
          <div className="flex flex-col justify-start space-y-5 md:pt-2">
            {content.rightParagraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-[13px] leading-relaxed md:text-sm"
                style={{ color: '#ffffff' }}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Bottom — Value Pillars */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title + index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="flex flex-col items-center text-center"
            >
              <div className="relative mb-5 h-12 w-12">
                <Image
                  src={toSrc(pillar.image || PLACEHOLDER)}
                  alt={pillar.title}
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <h3
                className="mb-3 text-sm font-bold italic md:text-base"
                style={{ color: '#ffffff' }}
              >
                {pillar.title}
              </h3>
              <p
                className="text-[11px] font-light leading-relaxed md:text-xs"
                style={{ color: '#ffffff' }}
              >
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
