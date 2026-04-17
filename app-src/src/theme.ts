// Rumi Design Tokens — shadcn-inspired
// Tight radii, refined type scale, single surface hierarchy

export const colors = {
  // Core backgrounds — one step lighter each level
  background:   '#0A0820',   // deepest page bg
  surface:      '#100E30',   // card / sheet surfaces
  surfaceRaised:'#181540',   // input fills, raised elements
  surfaceHover: '#201D50',   // hover / pressed state

  // Brand
  accent:       '#6C63FF',
  accentSoft:   '#8B83FF',
  accentDim:    'rgba(108, 99, 255, 0.15)',
  accentBorder: 'rgba(108, 99, 255, 0.35)',

  // Text — 4-step hierarchy
  textPrimary:   '#F4F3FF',   // headings, labels
  textSecondary: '#A9A6CC',   // body, subtitles
  textMuted:     '#6A6788',   // hints, timestamps
  textDisabled:  '#3D3B58',   // disabled states

  // Semantic
  success: '#34C759',
  warning: '#FF9F0A',
  danger:  '#FF453A',
  info:    '#0A84FF',

  // Hairline — used for all dividers / borders
  border:        'rgba(255, 255, 255, 0.08)',
  borderFocus:   'rgba(108, 99, 255, 0.55)',

  // Nav bar
  tabBarBg: '#0C0A26',

  // Legacy aliases — keep old references working
  white:       '#F4F3FF',
  textMutedLg: '#6A6788',
  green:       '#34C759',
  orange:      '#FF9F0A',
  pink:        '#FF2D92',
  gold:        '#FFD60A',
  red:         '#FF453A',
  card:        '#181540',
  accentLight: '#8B83FF',
};

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

// shadcn-style radius scale — consistent, restrained
export const radius = {
  xs:   4,
  sm:   8,
  md:   10,
  lg:   14,
  xl:   20,
  pill: 999,
};

// Typography scale — 5 sizes with matching line heights
export const type = {
  display:  { fontSize: 72, lineHeight: 80 },
  h1:       { fontSize: 30, lineHeight: 38 },
  h2:       { fontSize: 22, lineHeight: 30 },
  h3:       { fontSize: 18, lineHeight: 26 },
  body:     { fontSize: 16, lineHeight: 24 },
  small:    { fontSize: 14, lineHeight: 20 },
  caption:  { fontSize: 12, lineHeight: 16 },
  tiny:     { fontSize: 11, lineHeight: 15 },
};
