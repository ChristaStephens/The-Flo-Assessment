import { Guidelines } from './parts';

export function LogoPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-[#1e1533] p-8">
        <img
          src={`${import.meta.env.BASE_URL}tymflo-horizontal.png`}
          alt="TymFlo horizontal logo"
          className="w-full max-w-xl"
        />
      </section>
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ['Full lockup', 'tymflo-full.png'],
          ['Wordmark', 'tymflo-wordmark.png'],
          ['Icon', 'tymflo-icon.png'],
        ].map(([label, file]) => (
          <figure key={file} className="rounded-xl border bg-[#1e1533] p-5">
            <img src={`${import.meta.env.BASE_URL}${file}`} alt={`TymFlo ${label.toLowerCase()}`} className="h-28 w-full object-contain" />
            <figcaption className="mt-4 text-sm text-white/75">{label}</figcaption>
          </figure>
        ))}
      </section>
      <section className="rounded-xl border bg-card p-6 text-card-foreground">
        <h2 className="font-semibold">Logo use</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The sun mark symbolizes the hours of a day and continuous flow of time. Use the horizontal lockup whenever space allows; use the wordmark or icon only where the full lockup cannot fit.
        </p>
        <div className="mt-5">
          <Guidelines items={[
            { kind: 'do', text: 'Keep the logo clean, professional, modern, efficient, and reliable.' },
            { kind: 'dont', text: 'Use the logo as decoration in place of clear content hierarchy.' },
          ]} />
        </div>
      </section>
    </div>
  );
}

export function PatternPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2">
        <img src={`${import.meta.env.BASE_URL}../docs/references/brand-guidelines/image_1787531162479.png`} alt="TymFlo pattern guidance" className="w-full rounded-xl border" />
        <img src={`${import.meta.env.BASE_URL}../docs/references/brand-guidelines/image_1787530617869.png`} alt="TymFlo iconography guidance" className="w-full rounded-xl border" />
      </section>
      <section className="rounded-xl border bg-card p-6 text-card-foreground">
        <h2 className="font-semibold">Pattern and iconography rules</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          TymFlo icons are simple, 2D, technology-inspired shapes. Patterns blend technology, digital marketing, and innovatively inspired elements; keep them subtle so they support rather than overpower key content.
        </p>
        <div className="mt-5">
          <Guidelines items={[
            { kind: 'do', text: 'Use icons to support content, improve navigation, and maintain a cohesive modern aesthetic.' },
            { kind: 'do', text: 'Keep pattern applications clean, professional, and restrained.' },
            { kind: 'dont', text: 'Use decorative pattern density where it competes with a call to action or key message.' },
          ]} />
        </div>
      </section>
    </div>
  );
}