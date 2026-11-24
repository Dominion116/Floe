import type { Section, SubSection } from "@/content/types";
import { cn } from "@/lib/utils";

function Heading({ section, level }: { section: SubSection; level: 2 | 3 }) {
  const Tag = level === 2 ? "h2" : "h3";
  return (
    <Tag
      id={section.id}
      className={cn(
        "group scroll-mt-6",
        level === 2 ? "type-title" : "text-lg font-medium leading-snug text-ink"
      )}
    >
      {section.title}
      <a
        href={`#${section.id}`}
        aria-label={`Link to ${section.title}`}
        className="ml-2 rounded-sm font-sans font-normal text-ink-muted opacity-0 transition-opacity duration-150 focus-visible:opacity-100 group-hover:opacity-100"
      >
        #
      </a>
    </Tag>
  );
}

export function SectionList({ sections }: { sections: Section[] }) {
  return (
    <div className="space-y-12">
      {sections.map((section) => (
        <section key={section.id}>
          <Heading section={section} level={2} />
          <div className="doc mt-4">{section.body}</div>
          {section.children?.map((child) => (
            <section key={child.id} className="mt-8">
              <Heading section={child} level={3} />
              <div className="doc mt-3">{child.body}</div>
            </section>
          ))}
        </section>
      ))}
    </div>
  );
}
