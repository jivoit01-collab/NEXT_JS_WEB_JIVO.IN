'use client';

import dynamic from 'next/dynamic';

const PublicRuntime = dynamic(
  () => import('./public-runtime').then((module) => module.PublicRuntime),
  { ssr: false },
);

export function PublicRuntimeLoader() {
  return <PublicRuntime />;
}
