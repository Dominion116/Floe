import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

/** Shared frame for every page outside the landing hero. */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-white">
      <Navbar />
      <main id="main" tabIndex={-1} className="flex-1 page-padding">
        <div className="container-standard">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
