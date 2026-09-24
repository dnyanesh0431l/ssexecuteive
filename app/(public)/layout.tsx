// app/(public)/layout.tsx
import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ---------- Header ---------- */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center gap-4 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-[10px] bg-foreground">
              <span className="text-[15px] font-bold leading-none tracking-tight text-background">
                SS
              </span>
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-primary-red ring-2 ring-background" />
            </span>
            <span className="text-[19px] font-semibold tracking-tight text-foreground sm:text-[21px]">
              SS Executive
            </span>
          </Link>

          <nav className="ml-auto flex items-center gap-6 text-[13px] font-medium text-foreground/70 sm:gap-9">
            <Link
              href="/"
              className="relative py-1 transition-colors hover:text-foreground after:absolute after:-bottom-[1px] after:left-0 after:h-[2px] after:w-0 after:bg-primary-blue after:transition-all hover:after:w-full"
            >
              Home
            </Link>
            <Link
              href="/brands"
              className="relative py-1 transition-colors hover:text-foreground after:absolute after:-bottom-[1px] after:left-0 after:h-[2px] after:w-0 after:bg-primary-blue after:transition-all hover:after:w-full"
            >
              Collection
            </Link>
          </nav>
        </div>
      </header>

      {/* ---------- Page ---------- */}
      <main className="flex-1 bg-background">{children}</main>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-border bg-light-gray">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-7 sm:flex-row sm:px-8">
          <p className="text-[13px] text-foreground/50">
            © {new Date().getFullYear()} SS Executive. All rights reserved.
          </p>
          <p className="text-[13px] text-foreground/50">
            Tailored shirting, made for the boardroom
          </p>
        </div>
      </footer>
    </div>
  );
}
