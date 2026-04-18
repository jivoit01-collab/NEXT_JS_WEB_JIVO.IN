'use client';

import { motion } from 'framer-motion';
import {
  whyJivoContent as textDefaults,
  valuePillars as pillarDefaults,
} from '../data/home-content';
import { SafeImage } from '@/components/shared';
import type { WhyJivoContent } from '../types';

interface WhyJivoProps {
  data?: WhyJivoContent;
}

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

  // 🔥 smooth container animation
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.18, // slower = more engaging
      },
    },
  };

  // 🔥 premium text animation
  const item = {
    hidden: {
      opacity: 0,
      y: 40,
      filter: 'blur(6px)',
    },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1], // smooth easing
      },
    },
  };

  return (
    <section
      className="font-sans px-4 py-20 md:py-28"
      style={{ backgroundColor: '#7b593e', color: '#cbc995' }}
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }} // ✅ 20% trigger
        className="container mx-auto max-w-6xl"
      >

        {/* ── TOP SECTION ───────────────── */}
        <div className="mb-24 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-20">
          
          {/* LEFT */}
          <div>
            <motion.h2
              variants={item}
              className="font-jost-extrabold uppercase leading-[1.05] tracking-tight"
              style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}
            >
              {content.heading}
            </motion.h2>

            <motion.p variants={item} className="mt-4 text-base md:text-lg">
              {content.subheading}
            </motion.p>

            <motion.p
              variants={item}
              className="mt-8 text-[15px] italic leading-relaxed md:text-base"
            >
              {content.leftText}
            </motion.p>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col space-y-5 md:pt-2">
            {content.rightParagraphs.map((paragraph, index) => (
              <motion.p
                key={index}
                variants={item}
                className="text-[13px] leading-relaxed md:text-sm"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
        </div>

        {/* ── VALUE PILLARS ───────────────── */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title + index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -6, scale: 1.03 }}
              className="group flex flex-col items-center text-center"
            >
              <div className="relative mb-5 h-12 w-12 transition-transform duration-300 group-hover:scale-110">
                <SafeImage
                  src={pillar.image}
                  alt={pillar.title}
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>

              <h3 className="mb-3 text-sm font-jost-bold italic md:text-base">
                {pillar.title}
              </h3>

              <p className="text-[11px] leading-relaxed md:text-xs">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}