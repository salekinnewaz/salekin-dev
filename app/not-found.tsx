import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <span className="eyebrow">Error 404</span>
      <h1 className="heading-display heading-gradient text-6xl sm:text-7xl">
        no such file
      </h1>
      <p className="max-w-md text-fg-2">
        The link you opened isn&apos;t here. The portfolio is one continuous
        scroll — head home and use the side nav.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-primary">
          ← back home
        </Link>
        <a href="/#contact" className="btn-outline">
          ping me instead
        </a>
      </div>
    </section>
  );
}