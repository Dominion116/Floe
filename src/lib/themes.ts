import { CardTheme } from "./types";

export const CARD_THEMES: Record<string, CardTheme> = {
  glacial: {
    id: "glacial",
    name: "Yeti Glacial",
    subtitle: "Cool and calm",
    surfaceClass: "bg-theme-glacial",
    accentClass: "bg-theme-glacial-accent",
    iconName: "snowflake",
  },
  coffee: {
    id: "coffee",
    name: "Coffee Chill",
    subtitle: "Warm and casual",
    surfaceClass: "bg-theme-coffee",
    accentClass: "bg-theme-coffee-accent",
    iconName: "coffee",
  },
  birthday: {
    id: "birthday",
    name: "Birthday Pop",
    subtitle: "For celebrations",
    surfaceClass: "bg-theme-birthday",
    accentClass: "bg-theme-birthday-accent",
    iconName: "gift",
  },
  water: {
    id: "water",
    name: "Clean Water Blue",
    subtitle: "For the ocean",
    surfaceClass: "bg-theme-water",
    accentClass: "bg-theme-water-accent",
    iconName: "droplet",
  },
};
