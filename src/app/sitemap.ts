import type { MetadataRoute } from "next";
import { DOC_PAGES, hrefOf } from "@/content/docs";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/send", ...DOC_PAGES.map(hrefOf), "/privacy", "/terms"].map((path) => ({
    url: `${SITE_URL}${path}`,
  }));
}
