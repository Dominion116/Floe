import { Reveal } from "./Reveal";

interface SectionHeaderProps {
  id: string;
  title: string;
  lede: string;
}

/** Split header: title on 7 columns, lede on 5. Stacks below 1024px. */
export function SectionHeader({ id, title, lede }: SectionHeaderProps) {
  return (
    <Reveal className="grid gap-4 lg:grid-cols-12 lg:gap-8 mb-10 sm:mb-12 lg:mb-16">
      <h2 id={id} className="type-headline lg:col-span-7">
        {title}
      </h2>
      <p className="type-lede lg:col-span-5 lg:pt-2">{lede}</p>
    </Reveal>
  );
}
