import type { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl } from "./lib/seo";

/**
 * Serves /robots.txt. The admin panel and the JSON API are kept out of the
 * index — they hold no search value and `/api/*` responses crawled as pages
 * would dilute the site's quality signals.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
