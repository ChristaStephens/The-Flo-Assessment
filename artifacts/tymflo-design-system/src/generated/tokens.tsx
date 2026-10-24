/* GENERATED FROM tokens.json -- DO NOT EDIT. Run scripts/build-tokens.mjs. */
// Portable design tokens (colors as hex). Web consumes the theme via
// src/index.css; mobile (Expo) and any other platform import this object so the
// whole product shares one source of truth.
export const tokens = {
  "color": {
    "light": {
      "primary": "#F69679",
      "secondary": "#EADACC",
      "accent": "#D89000",
      "background": "#FFFDFC",
      "foreground": "#1E1533",
      "card": "#FFFFFF",
      "cardForeground": "#1E1533",
      "popover": "#FFFFFF",
      "popoverForeground": "#1E1533",
      "border": "#EADACC",
      "input": "#DCC9BC",
      "ring": "#105679",
      "primaryForeground": "#1E1533",
      "secondaryForeground": "#1E1533",
      "muted": "#F4C7C5",
      "mutedForeground": "#5A4E6B",
      "accentForeground": "#1E1533",
      "destructive": "#A64A41",
      "destructiveForeground": "#FFFFFF",
      "chart1": "#F69679",
      "chart2": "#105679",
      "chart3": "#B791C9",
      "chart4": "#D89000",
      "chart5": "#1E1533",
      "sidebar": "#1E1533",
      "sidebarForeground": "#FFFFFF",
      "sidebarBorder": "#46345F",
      "sidebarPrimary": "#F69679",
      "sidebarPrimaryForeground": "#1E1533",
      "sidebarAccent": "#46345F",
      "sidebarAccentForeground": "#FFFFFF",
      "sidebarRing": "#F69679"
    },
    "dark": {
      "primary": "#F69679",
      "secondary": "#46345F",
      "accent": "#D89000",
      "background": "#1E1533",
      "foreground": "#FFFFFF",
      "card": "#2D2148",
      "cardForeground": "#FFFFFF",
      "popover": "#2D2148",
      "popoverForeground": "#FFFFFF",
      "border": "#5E4B78",
      "input": "#5E4B78",
      "ring": "#F69679",
      "primaryForeground": "#1E1533",
      "secondaryForeground": "#FFFFFF",
      "muted": "#46345F",
      "mutedForeground": "#D9CDE2",
      "accentForeground": "#1E1533",
      "destructive": "#F39679",
      "destructiveForeground": "#1E1533",
      "chart1": "#F69679",
      "chart2": "#68A9C8",
      "chart3": "#D9B7E5",
      "chart4": "#F0BD55",
      "chart5": "#EADACC",
      "sidebar": "#1E1533",
      "sidebarForeground": "#FFFFFF",
      "sidebarBorder": "#46345F",
      "sidebarPrimary": "#F69679",
      "sidebarPrimaryForeground": "#1E1533",
      "sidebarAccent": "#46345F",
      "sidebarAccentForeground": "#FFFFFF",
      "sidebarRing": "#F69679"
    }
  },
  "fontFamily": {
    "sans": [
      "Montserrat",
      "sans-serif"
    ],
    "serif": [
      "Spectral",
      "Georgia",
      "serif"
    ],
    "mono": [
      "Montserrat",
      "sans-serif"
    ]
  },
  "radius": "0.5rem",
  "spacing": "0.25rem"
} as const;

export type Tokens = typeof tokens;
export default tokens;
