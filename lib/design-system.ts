// Tokens del sistema de diseño de mcFaro
// Usar estos valores en componentes nuevos — no hardcodear colores directamente

export const colors = {
  // Marca
  primary:       "#C85A2A",
  primaryDark:   "#7A3D1A",
  primaryLight:  "#FDF0E6",
  secondary:     "#E87A3A",
  accent:        "#F5C842",

  // Texto
  textDark:      "#3D1A0A",
  textMuted:     "#9A6A2A",
  textSubtle:    "#A89080",

  // Bordes y fondos
  border:        "#F0E5D0",
  bgWarm:        "#F7EDD5",

  // Estados
  success:       "#16A34A",
  error:         "#DC2626",
  warning:       "#D97706",
  info:          "#2563EB",
} as const;

export const radii = {
  sm:   "rounded-xl",
  md:   "rounded-2xl",
  lg:   "rounded-3xl",
  full: "rounded-full",
} as const;

export const minTouchTarget = "min-h-[48px]"; // WCAG AA — objetivo táctil mínimo
