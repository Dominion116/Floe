import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { InlineToc, Toc } from "@/components/docs/Toc";
import { SectionList } from "@/components/docs/SectionList";
import { tocOf, type LegalDoc } from "@/content/types";

interface LegalPageProps {
  doc: LegalDoc;
  related: { href: string; label: string };
}

export function LegalPage({ doc, related }: LegalPageProps) {
  const toc = tocOf(doc.sections);

  return (
    <PageShell>
      <div className="lg:grid lg:grid-cols-[minmax(0,44rem)_14rem] lg:justify-between lg:gap-x-12">
        <article className="min-w-0">
          <header>
            <h1 className="type-headline">{doc.title}</h1>
            <p className="type-lede mt-3">{doc.lede}</p>
            <p className="type-help mt-4">Last updated {doc.updated}</p>
          </header>

          <section aria-labelledby="summary" className="mt-8 rounded-3xl bg-frost-light p-6 sm:p-8">
            <h2 id="summary" className="type-title">
              The short version
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-ink">
              {doc.summary.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-ink/75">
              This summary is here to help. The full text below is what applies.
            </p>
          </section>

          <InlineToc items={toc} className="mt-6 lg:hidden" />

          <div className="mt-12">
            <SectionList sections={doc.sections} />
          </div>

          <p className="mt-14">
            <Link
              href={related.href}
              className="link inline-flex min-h-[44px] items-center text-base font-medium"
            >
              {related.label}
            </Link>
          </p>
        </article>

        <Toc items={toc} className="hidden lg:block" />
      </div>
    </PageShell>
  );
}
