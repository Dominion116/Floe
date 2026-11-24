import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { InlineToc, Toc } from "@/components/docs/Toc";
import { SectionList } from "@/components/docs/SectionList";
import { DOC_GROUPS, DOC_PAGES, hrefOf } from "@/content/docs";
import { tocOf } from "@/content/types";
import { REPO_URL } from "@/lib/site";

interface DocsPageProps {
  params: Promise<{ slug?: string[] }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return DOC_PAGES.map((page) => ({ slug: page.slug ? [page.slug] : [] }));
}

const findPage = (slug: string[] = []) => DOC_PAGES.findIndex((p) => p.slug === slug.join("/"));

export async function generateMetadata({ params }: DocsPageProps): Promise<Metadata> {
  const page = DOC_PAGES[findPage((await params).slug)];
  if (!page) return {};
  return {
    title: `${page.title} · Floe docs`,
    description: page.description,
    alternates: { canonical: hrefOf(page) },
  };
}

export default async function DocsPage({ params }: DocsPageProps) {
  const index = findPage((await params).slug);
  const page = DOC_PAGES[index];
  if (!page) notFound();

  const group = DOC_GROUPS.find((g) => g.pages.includes(page));
  const toc = tocOf(page.sections);
  const previous = DOC_PAGES[index - 1];
  const next = DOC_PAGES[index + 1];

  return (
    <>
      <article className="min-w-0">
        <header>
          <p className="type-help">{group?.title}</p>
          <h1 className="type-headline mt-2">{page.title}</h1>
          <p className="type-lede mt-3">{page.description}</p>
        </header>

        <InlineToc key={page.slug} items={toc} className="mt-6 min-[1120px]:hidden" />

        <div className="mt-10">
          <SectionList sections={page.sections} />
        </div>

        <footer className="mt-14">
          <a
            href={`${REPO_URL}/edit/main/src/content/docs/${page.file}`}
            target="_blank"
            rel="noopener noreferrer"
            className="link inline-flex min-h-[44px] items-center text-sm"
          >
            Edit this page on GitHub
          </a>
          <nav aria-label="Previous and next page" className="mt-4 grid gap-3 sm:grid-cols-2">
            {previous && (
              <Link
                href={hrefOf(previous)}
                className="card flex items-center gap-3 p-4 transition-colors duration-150 hover:bg-snow"
              >
                <ArrowLeft className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="type-help block">Previous</span>
                  <span className="block text-[15px] font-medium text-ink">{previous.title}</span>
                </span>
              </Link>
            )}
            {next && (
              <Link
                href={hrefOf(next)}
                className="card flex items-center justify-end gap-3 p-4 text-right transition-colors duration-150 hover:bg-snow sm:col-start-2"
              >
                <span className="min-w-0">
                  <span className="type-help block">Next</span>
                  <span className="block text-[15px] font-medium text-ink">{next.title}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
              </Link>
            )}
          </nav>
        </footer>
      </article>

      <Toc key={`toc-${page.slug}`} items={toc} className="hidden min-[1120px]:block" />
    </>
  );
}
