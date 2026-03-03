// ─── Brand Palette ────────────────────────────────────────────────────────────
export const Palette = {
  inkBlack: "#000814",
  prussianBlue: "#001d3d",
  regalNavy: "#003566",
  schoolBusYellow: "#ffc300",
  gold: "#ffd60a",
  white: "#ffffff",
  offWhite: "#f0f4f8",
  error: "#ff4d4d",
  errorLight: "#cc0000",
  success: "#4caf50",
} as const;

// ─── Semantic Color Tokens ─────────────────────────────────────────────────────
// Dark theme is primary (deep navy + yellow accent)
// Light theme is provided for system compatibility
export const Colors = {
  dark: {
    background: Palette.inkBlack,
    surface: Palette.prussianBlue,
    surfaceElevated: Palette.regalNavy,
    primary: Palette.schoolBusYellow,
    primaryVariant: Palette.gold,
    text: Palette.white,
    textSecondary: "rgba(255,255,255,0.65)",
    textMuted: "rgba(255,255,255,0.4)",
    placeholder: "rgba(255,255,255,0.4)",
    border: Palette.regalNavy,
    borderLight: "rgba(255,255,255,0.15)",
    inputBackground: "rgba(0,29,61,0.8)",
    icon: "rgba(255,255,255,0.7)",
    tint: Palette.schoolBusYellow,
    tabIconDefault: "rgba(255,255,255,0.4)",
    tabIconSelected: Palette.schoolBusYellow,
    tabBarBackground: Palette.prussianBlue,
    error: Palette.error,
    success: Palette.success,
  },
  light: {
    background: Palette.offWhite,
    surface: Palette.white,
    surfaceElevated: Palette.white,
    primary: Palette.regalNavy,
    primaryVariant: Palette.prussianBlue,
    text: Palette.inkBlack,
    textSecondary: "#3a3a3a",
    textMuted: "#888888",
    placeholder: "#aaaaaa",
    border: "#d0d7de",
    borderLight: "#f0f0f0",
    inputBackground: Palette.white,
    icon: "#444444",
    tint: Palette.regalNavy,
    tabIconDefault: "#888888",
    tabIconSelected: Palette.regalNavy,
    tabBarBackground: Palette.white,
    error: Palette.errorLight,
    success: Palette.success,
  },
} as const;

// ─── Spacing Scale ─────────────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ─── Border Radius Scale ───────────────────────────────────────────────────────
export const Radius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// ─── Typography ────────────────────────────────────────────────────────────────
export const FontSize = {
  xs: 11,
  sm: 13,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const FontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  extrabold: "800" as const,
} as const;
