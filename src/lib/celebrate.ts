import confetti from "canvas-confetti";

/** Confetti in the palette colors, read from the CSS tokens. */
export function celebrate(): void {
  try {
    const styles = getComputedStyle(document.documentElement);
    const colors = ["frost", "mist", "ink", "frost-dark"].map((name) => {
      const channels = styles.getPropertyValue(`--${name}-rgb`).trim().split(/\s+/).map(Number);
      return `#${channels.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
    });
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.55 },
      colors,
      disableForReducedMotion: true,
    });
  } catch {
    // Decorative only
  }
}
