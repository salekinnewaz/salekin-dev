import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <span className="eyebrow">Error 404 // not found</span>
      <h1 className="heading-display heading-gradient text-6xl sm:text-7xl">
        <span className="font-mono text-accent-2">$</span> ls:{' '}
        <span className="text-fg">no such file</span>
      </h1>
      <p className="max-w-md font-mono text-sm text-fg-2">
        <span className="text-accent-2">{'> '}</span>ENOENT: the path you
        opened isn&apos;t in the tree. The portfolio is one continuous
        scroll — head home and use the side nav.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-primary">
          ← cd ~
        </Link>
        <a href="/#contact" className="btn-outline">
          $ POST /contact
        </a>
      </div>
    </section>
  );
}