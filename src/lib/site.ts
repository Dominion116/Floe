export const REPO_URL = "https://github.com/Dominion116/Floe";
export const ISSUES_URL = `${REPO_URL}/issues`;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";
/** Origin used in page metadata, robots.txt and the sitemap. */
export const SITE_URL = URL.canParse(APP_URL)
  ? new URL(APP_URL).origin
  : "https://floeonsui.vercel.app";

/** Null until a private contact address has been configured. */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null;
