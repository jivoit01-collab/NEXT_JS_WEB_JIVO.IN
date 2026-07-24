import type { ElementType } from 'react';
import { PlaceholderPanel } from '../../components/placeholder-panel';
import type { WidgetProps } from '../types';

/**
 * Factory for a reusable placeholder widget — reuses the existing
 * `PlaceholderPanel` so there is ONE "coming soon" UI for every data widget.
 * A real implementation later swaps the body without touching the renderer.
 */
export function makePlaceholderWidget(opts: {
  title: string;
  description: string;
  icon: ElementType;
  minHeight?: string;
}) {
  function PlaceholderWidget(_props: WidgetProps) {
    void _props;
    return (
      <PlaceholderPanel
        title={opts.title}
        description={opts.description}
        icon={opts.icon}
        minHeight={opts.minHeight ?? 'min-h-48'}
      />
    );
  }
  PlaceholderWidget.displayName = `PlaceholderWidget(${opts.title})`;
  return PlaceholderWidget;
}
