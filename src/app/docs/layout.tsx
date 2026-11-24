import { PageShell } from "@/components/PageShell";
import { DocsSidebar, type NavGroup } from "@/components/docs/DocsSidebar";
import type { SearchEntry } from "@/components/docs/DocsSearch";
import { DOC_GROUPS, hrefOf } from "@/content/docs";

const groups: NavGroup[] = DOC_GROUPS.map((group) => ({
  title: group.title,
  pages: group.pages.map((page) => ({ href: hrefOf(page), title: page.title })),
}));

const entries: SearchEntry[] = DOC_GROUPS.flatMap((group) =>
  group.pages.flatMap((page) => [
    {
      href: hrefOf(page),
      title: page.title,
      context: group.title,
      keywords: page.description,
      isPage: true,
    },
    ...page.sections
      .flatMap((section) => [section, ...(section.children ?? [])])
      .map((section) => ({
        href: `${hrefOf(page)}#${section.id}`,
        title: section.title,
        context: page.title,
        keywords: section.keywords ?? "",
        isPage: false,
      })),
  ])
);

/** Three columns from 1120px: pages, content, and the headings on this page. */
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageShell>
      <div className="lg:grid lg:grid-cols-[12.5rem_minmax(0,1fr)] lg:gap-x-10 min-[1120px]:grid-cols-[12.5rem_minmax(0,1fr)_11.5rem]">
        <DocsSidebar groups={groups} entries={entries} />
        {children}
      </div>
    </PageShell>
  );
}
