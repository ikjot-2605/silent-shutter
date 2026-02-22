/**
 * Image CDN Configuration
 *
 * DEVELOPMENT: Uses Unsplash placeholder images (no setup needed)
 * PRODUCTION:  Set CDN_BASE_URL to your Azure CDN endpoint
 *
 * Azure CDN URL format: https://<endpoint>.azureedge.net/<container>
 * Example: https://silentshutter.azureedge.net/photos
 *
 * Expected blob structure:
 *   /hero/main.jpg
 *   /about/photographer.jpg
 *   /landscapes/cover.jpg
 *   /nature/cover.jpg
 *   /street/cover.jpg
 *   /architecture/cover.jpg
 *   /travel/cover.jpg
 */
const CDN_BASE_URL = "";

const img = (cdnPath: string, unsplashFallback: string): string =>
  CDN_BASE_URL ? `${CDN_BASE_URL}/${cdnPath}` : unsplashFallback;

export const images = {
  hero: img(
    "hero/main.jpg",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80&auto=format&fit=crop"
  ),
  about: img(
    "about/photographer.jpg",
    "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80&auto=format&fit=crop"
  ),
};

export interface CategoryConfig {
  id: string;
  name: string;
  count: number;
  cover: string;
}

export const categories: CategoryConfig[] = [
  {
    id: "landscapes",
    name: "Landscapes",
    count: 12,
    cover: img(
      "landscapes/cover.jpg",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80&auto=format&fit=crop"
    ),
  },
  {
    id: "nature",
    name: "Nature",
    count: 8,
    cover: img(
      "nature/cover.jpg",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80&auto=format&fit=crop"
    ),
  },
  {
    id: "street",
    name: "Street",
    count: 15,
    cover: img(
      "street/cover.jpg",
      "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800&q=80&auto=format&fit=crop"
    ),
  },
  {
    id: "architecture",
    name: "Architecture",
    count: 10,
    cover: img(
      "architecture/cover.jpg",
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=80&auto=format&fit=crop"
    ),
  },
  {
    id: "travel",
    name: "Travel",
    count: 20,
    cover: img(
      "travel/cover.jpg",
      "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80&auto=format&fit=crop"
    ),
  },
];
