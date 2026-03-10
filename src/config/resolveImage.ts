/**
 * Resolve image src paths for GitHub Pages deployment.
 * Public assets need the Vite base URL prefix (e.g. /silent-shutter/).
 */
export const resolveImageSrc = (src: string): string => {
  if (src.startsWith("/") && !src.startsWith("//")) {
    const base = import.meta.env.BASE_URL;
    if (base !== "/" && !src.startsWith(base)) {
      return base + src.slice(1);
    }
  }
  return src;
};
