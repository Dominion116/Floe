import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Private pages use noindex instead of a rule here. Link previews and noindex both need a crawl.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
