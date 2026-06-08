/** Harvi application color system — shared across light/dark themes */

export const lightPalette = {
  background: "#ffffff",
  foreground: "#0a0a0a",
  primary: "#0ea5e9",
  primaryForeground: "#ffffff",
  card: "#f8fafc",
  cardForeground: "#0a0a0a",
  secondary: "#f1f5f9",
  secondaryForeground: "#0a0a0a",
  muted: "#f1f5f9",
  mutedForeground: "#94a3b8",
  accent: "#f1f5f9",
  accentForeground: "#0a0a0a",
  success: "#10b981",
  warning: "#f59e0b",
  destructive: "#ef4444",
  destructiveForeground: "#ffffff",
  border: "#e2e8f0",
  input: "#e2e8f0",
  ring: "#0ea5e9",
} as const;

export const darkPalette = {
  background: "#0f172a",
  foreground: "#f1f5f9",
  primary: "#38bdf8",
  primaryForeground: "#0f172a",
  card: "#1e293b",
  cardForeground: "#f1f5f9",
  secondary: "#334155",
  secondaryForeground: "#f1f5f9",
  muted: "#1e293b",
  mutedForeground: "#94a3b8",
  accent: "#334155",
  accentForeground: "#f1f5f9",
  success: "#10b981",
  warning: "#f59e0b",
  destructive: "#f43f5e",
  destructiveForeground: "#ffffff",
  border: "#334155",
  input: "#334155",
  ring: "#38bdf8",
} as const;

export const chartColors = {
  sky: "#0ea5e9",
  emerald: "#10b981",
  amber: "#f59e0b",
  violet: "#8b5cf6",
  pink: "#ec4899",
} as const;

export const yearGradients = {
  sky: ["#0ea5e9", "#0284c7"],
  emerald: ["#10b981", "#059669"],
  amber: ["#f59e0b", "#d97706"],
  violet: ["#8b5cf6", "#7c3aed"],
  pink: ["#ec4899", "#db2777"],
  teal: ["#14b8a6", "#0d9488"],
} as const;

export const borderRadius = 24;
