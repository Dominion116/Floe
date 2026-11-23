import { CardTheme } from "./types";

export const CARD_THEMES: Record<string, CardTheme> = {
  glacial: {
    id: "glacial",
    name: "Yeti Glacial",
    subtitle: "Arctic frost minimalism",
    bgGradient: "from-[#F0F4FD] via-[#FFFFFF] to-[#E3EBFC]",
    badgeBg: "bg-[#C3CEEF]/40 text-[#121111]",
    accentColor: "#98A9E6",
    iconName: "snowflake",
  },
  coffee: {
    id: "coffee",
    name: "Coffee Chill",
    subtitle: "Warm, cozy casual split",
    bgGradient: "from-[#FAF6F0] via-[#FFFFFF] to-[#EFE7DC]",
    badgeBg: "bg-[#D8C7B4]/40 text-[#121111]",
    accentColor: "#A6896E",
    iconName: "coffee",
  },
  birthday: {
    id: "birthday",
    name: "Birthday Pop",
    subtitle: "Celebratory festive vibes",
    bgGradient: "from-[#FDF2F7] via-[#FFFFFF] to-[#FCE3EE]",
    badgeBg: "bg-[#F3C1DC]/50 text-[#121111]",
    accentColor: "#DE6B98",
    iconName: "gift",
  },
  water: {
    id: "water",
    name: "Clean Water",
    subtitle: "Lofi mission ocean blue",
    bgGradient: "from-[#EBF7F9] via-[#FFFFFF] to-[#D5EFF4]",
    badgeBg: "bg-[#9EE0ED]/40 text-[#121111]",
    accentColor: "#3EA5BA",
    iconName: "droplet",
  },
};
