/**
 * Utility functions for image validation and optimization
 */

// Only block domains that are known to provide non-direct image URLs or redirects
const BLOCKED_DOMAINS = [
  "facebook.com",
  "fb.com",
  "instagram.com",
  "pinterest.com",
  "twitter.com",
  "x.com",
  "linkedin.com",
  "tiktok.com",
];

/**
 * Check if a URL is likely to be a direct image link
 * More permissive approach - only block known problematic domains
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);

    // Check for blocked domains (only social media that redirects)
    const hostname = urlObj.hostname.toLowerCase();
    if (BLOCKED_DOMAINS.some((domain) => hostname.includes(domain))) {
      return false;
    }

    // Allow all other URLs since many valid image URLs don't end with extensions
    // (like Spotify CDN, Wikipedia thumbnails, etc.)
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove duplicate images based on URL similarity
 */
export function deduplicateImages<
  T extends { url: string; thumbnail?: string }
>(images: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const image of images) {
    // Create a unique key based on URL
    const urlKey = normalizeUrl(image.url);

    // Skip if we've seen this URL before
    if (seen.has(urlKey)) {
      continue;
    }

    seen.add(urlKey);
    result.push(image);
  }

  return result;
}

/**
 * Normalize URL for comparison (remove query params, fragments, etc.)
 */
function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Keep query parameters for CDN URLs but remove fragments
    return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}${urlObj.search}`;
  } catch {
    return url;
  }
}
