/** Apps that open links in a browser of their own, where Google refuses to log people in. */
const APPS: [name: string, pattern: RegExp][] = [
  ["Instagram", /Instagram/i],
  ["Messenger", /FBAN\/Messenger|FB_IAB\/(Orca|MESSENGER)/i],
  ["Facebook", /FBAN|FBAV|FB_IAB/i],
  ["TikTok", /musical_ly|BytedanceWebview|TikTok|trill_/i],
  ["Snapchat", /Snapchat/i],
  ["X", /Twitter for iPhone|TwitterAndroid/i],
  ["LinkedIn", /LinkedInApp/i],
  ["LINE", /\bLine\//],
  ["WeChat", /MicroMessenger/i],
  ["Telegram", /Telegram-Android|Telegram-iOS/i],
];

/**
 * The app whose browser this page is in, or "this app" when only that much is known. Null in a
 * normal browser. Some apps can't be told apart from one, so never rely on this to block anything.
 */
export function detectInAppBrowser(): string | null {
  const ua = navigator.userAgent;
  const named = APPS.find(([, pattern]) => pattern.test(ua));
  if (named) return named[0];

  // Telegram hides in the user agent on some phones, but adds these to the page.
  if ("TelegramWebview" in window || "TelegramWebviewProxy" in window) return "Telegram";

  if (/Android/.test(ua) && /; wv\)/.test(ua)) return "this app";
  // Real iOS browsers all say Safari. Sites saved to the home screen don't, and are fine.
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (/iPhone|iPad|iPod/.test(ua) && !/Safari\//.test(ua) && !standalone) return "this app";
  return null;
}

/** The browser to suggest instead. */
export function suggestedBrowser(): string {
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) return "Safari";
  return /Android/.test(navigator.userAgent) ? "Chrome" : "another browser";
}
