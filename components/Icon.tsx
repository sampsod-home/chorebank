import React from 'react';
import Svg, { Path, Circle, Polygon, Polyline } from 'react-native-svg';
import { colors } from '../theme';

export type IconName =
  | 'home'
  | 'chores'
  | 'payday'
  | 'family'
  | 'plus'
  | 'edit'
  | 'trash'
  | 'check'
  | 'arrow'
  | 'utensils'
  | 'shirt'
  | 'book'
  | 'car'
  | 'droplet'
  | 'paw'
  | 'leaf'
  | 'sparkles'
  | 'star';

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/** Stroke-based icon set ported verbatim from the prototype's inline SVGs. */
export function Icon({ name, size = 22, color = colors.text, strokeWidth = 2 }: Props) {
  const stroke = { stroke: color, strokeWidth, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const body = () => {
    switch (name) {
      case 'home':
        return (
          <>
            <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" {...stroke} />
            <Path d="M9 22V12h6v10" {...stroke} />
          </>
        );
      case 'chores':
        return (
          <>
            <Path d="m9 11 3 3L22 4" {...stroke} />
            <Path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" {...stroke} />
          </>
        );
      case 'payday':
        return (
          <>
            <Path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" {...stroke} />
            <Path d="M3 5v14a2 2 0 0 0 2 2h16v-5" {...stroke} />
            <Path d="M18 12a2 2 0 0 0 0 4h4v-4z" {...stroke} />
          </>
        );
      case 'family':
        return (
          <>
            <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" {...stroke} />
            <Circle cx={9} cy={7} r={4} {...stroke} />
            <Path d="M22 21v-2a4 4 0 0 0-3-3.87" {...stroke} />
            <Path d="M16 3.13a4 4 0 0 1 0 7.75" {...stroke} />
          </>
        );
      case 'plus':
        return (
          <>
            <Path d="M12 5v14" {...stroke} />
            <Path d="M5 12h14" {...stroke} />
          </>
        );
      case 'edit':
        return <Path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" {...stroke} />;
      case 'trash':
        return (
          <>
            <Path d="M3 6h18" {...stroke} />
            <Path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" {...stroke} />
            <Path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" {...stroke} />
          </>
        );
      case 'check':
        return <Polyline points="20 6 9 17 4 12" {...stroke} />;
      case 'arrow':
        return <Path d="M5 12h14M12 5l7 7-7 7" {...stroke} />;
      case 'utensils':
        return (
          <>
            <Path d="M3 2v7c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2V2" {...stroke} />
            <Path d="M7 2v20" {...stroke} />
            <Path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" {...stroke} />
          </>
        );
      case 'shirt':
        return <Path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" {...stroke} />;
      case 'book':
        return (
          <>
            <Path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" {...stroke} />
            <Path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" {...stroke} />
          </>
        );
      case 'car':
        return (
          <>
            <Path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" {...stroke} />
            <Circle cx={7} cy={17} r={2} {...stroke} />
            <Path d="M9 17h6" {...stroke} />
            <Circle cx={17} cy={17} r={2} {...stroke} />
          </>
        );
      case 'droplet':
        return <Path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" {...stroke} />;
      case 'paw':
        return (
          <>
            <Circle cx={11} cy={4} r={2} {...stroke} />
            <Circle cx={18} cy={8} r={2} {...stroke} />
            <Circle cx={20} cy={16} r={2} {...stroke} />
            <Path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" {...stroke} />
          </>
        );
      case 'leaf':
        return (
          <>
            <Path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" {...stroke} />
            <Path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 11 13.5 11 11" {...stroke} />
          </>
        );
      case 'sparkles':
        return <Path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z" {...stroke} />;
      case 'star':
        return <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" {...stroke} />;
      default:
        return null;
    }
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {body()}
    </Svg>
  );
}

/** Maps the domain choreIcon bgKey to a concrete tile color. */
export function iconBgColor(bgKey: string): string {
  switch (bgKey) {
    case 'var-neutral-700':
      return colors.neutral[700];
    case 'var-neutral-800':
      return colors.neutral[800];
    case 'var-accent-600':
      return colors.accentRamp[600];
    case 'var-accent-700':
      return colors.accentRamp[700];
    default:
      return colors.neutral[800];
  }
}
