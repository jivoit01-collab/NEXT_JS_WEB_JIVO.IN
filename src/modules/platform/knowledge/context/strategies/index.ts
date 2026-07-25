// ==========================================================================
// Context strategies — how a context is shaped (size, citations, compression,
// collection bias). Registry-driven so a future strategy plugs in with zero
// pipeline changes. Pure/isomorphic.
// ==========================================================================

import type { ContextStrategy, ContextStrategyKey, StrategyConfig } from '../types';
import { CONTEXT_CONFIG } from '../config';

const BUILT_IN: ContextStrategy[] = [
  {
    key: 'compact',
    name: 'Compact',
    description: 'Smallest useful context — few docs, aggressive compression, no citations.',
    config: { maxDocuments: 3, maxCharsPerDoc: 400, includeCitations: false, deduplicate: true, compress: true, budgetRatio: 0.5 },
  },
  {
    key: 'balanced',
    name: 'Balanced',
    description: 'Good default — moderate size, deduped, with citations.',
    config: { maxDocuments: 6, maxCharsPerDoc: 800, includeCitations: true, deduplicate: true, compress: true, budgetRatio: 0.8 },
  },
  {
    key: 'detailed',
    name: 'Detailed',
    description: 'Maximum grounding — more docs and longer excerpts, with citations.',
    config: { maxDocuments: 10, maxCharsPerDoc: 1400, includeCitations: true, deduplicate: true, compress: false, budgetRatio: 0.95 },
  },
  {
    key: 'citation',
    name: 'Citation-focused',
    description: 'Preserve attribution above all — always cite, keep more distinct sources.',
    config: { maxDocuments: 8, maxCharsPerDoc: 600, includeCitations: true, deduplicate: true, compress: true, budgetRatio: 0.8 },
  },
  {
    key: 'product',
    name: 'Product-focused',
    description: 'Bias toward product knowledge.',
    config: { maxDocuments: 6, maxCharsPerDoc: 800, includeCitations: true, deduplicate: true, compress: true, budgetRatio: 0.8, preferCollections: ['products'] },
  },
  {
    key: 'faq',
    name: 'FAQ-focused',
    description: 'Short, direct answers biased toward FAQ content.',
    config: { maxDocuments: 5, maxCharsPerDoc: 500, includeCitations: true, deduplicate: true, compress: true, budgetRatio: 0.7, preferCollections: ['faq'] },
  },
  {
    key: 'recipe',
    name: 'Recipe-focused',
    description: 'Longer, step-friendly context biased toward recipes.',
    config: { maxDocuments: 6, maxCharsPerDoc: 1200, includeCitations: true, deduplicate: true, compress: false, budgetRatio: 0.9, preferCollections: ['recipes'] },
  },
];

const globalRef = globalThis as typeof globalThis & {
  __jivoContextStrategies?: Map<ContextStrategyKey, ContextStrategy>;
};
const registry: Map<ContextStrategyKey, ContextStrategy> =
  globalRef.__jivoContextStrategies ?? new Map(BUILT_IN.map((s) => [s.key, s]));
if (!globalRef.__jivoContextStrategies) globalRef.__jivoContextStrategies = registry;

export function registerContextStrategy(strategy: ContextStrategy): void {
  registry.set(strategy.key, strategy);
}

export function getContextStrategies(): ContextStrategy[] {
  return [...registry.values()];
}

/** Resolve a strategy by key, falling back to the configured default. */
export function resolveContextStrategy(key?: ContextStrategyKey): ContextStrategy {
  return (
    (key && registry.get(key)) ??
    registry.get(CONTEXT_CONFIG.defaultStrategy) ??
    BUILT_IN[1] // balanced
  );
}

export type { StrategyConfig };
