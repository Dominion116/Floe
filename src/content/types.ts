import type { ReactNode } from "react";

export interface SubSection {
  id: string;
  title: string;
  body: ReactNode;
  /** Extra words the docs search should match. */
  keywords?: string;
}

export interface Section extends SubSection {
  children?: SubSection[];
}

/** The table of contents, the search index and the page itself all come from this. */
export interface DocPage {
  /** Empty for the docs home. */
  slug: string;
  /** File name in src/content/docs, for the edit link. */
  file: string;
  title: string;
  description: string;
  sections: Section[];
}

export interface LegalDoc {
  title: string;
  lede: string;
  updated: string;
  summary: string[];
  sections: Section[];
}

export interface TocItem {
  id: string;
  title: string;
  level: 2 | 3;
}

export const tocOf = (sections: Section[]): TocItem[] =>
  sections.flatMap((section) => [
    { id: section.id, title: section.title, level: 2 as const },
    ...(section.children ?? []).map((child) => ({
      id: child.id,
      title: child.title,
      level: 3 as const,
    })),
  ]);
