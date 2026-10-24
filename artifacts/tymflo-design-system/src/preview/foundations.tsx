import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Guidelines } from './parts';

const CORE_SWATCHES = [
  { name: 'Primary', className: 'bg-primary' },
  { name: 'Secondary', className: 'bg-secondary' },
  { name: 'Accent', className: 'bg-accent' },
] as const;

const SUPPORTING_SWATCHES = [
  { name: 'TymFlo Purple', className: 'bg-[#463176]' },
  { name: 'Atomic Tangerine', className: 'bg-[#f69679]' },
  { name: 'Almond', className: 'bg-[#eadacc]' },
  { name: 'Tea Rose', className: 'bg-[#f4c7c5]' },
  { name: 'African Violet', className: 'bg-[#b791c9]' },
  { name: 'Lapis Lazuli', className: 'bg-[#105679]' },
  { name: 'Harvest Gold', className: 'bg-[#d89000]' },
  { name: 'Dark Purple', className: 'bg-[#1e1533]' },
  { name: 'Background', className: 'border bg-background' },
  { name: 'Foreground', className: 'bg-foreground' },
  { name: 'Muted', className: 'bg-muted' },
  { name: 'Destructive', className: 'bg-destructive' },
  { name: 'Border', className: 'bg-border' },
] as const;

const TYPE_SCALE = [
  { label: 'Display', className: 'text-4xl font-bold' },
  { label: 'Heading', className: 'text-2xl font-semibold' },
  { label: 'Body', className: 'text-base' },
  { label: 'Label', className: 'text-sm font-medium' },
  { label: 'Caption', className: 'text-sm text-muted-foreground' },
] as const;

const SPACING_SCALE = [
  { label: '4', className: 'w-4' },
  { label: '8', className: 'w-8' },
  { label: '12', className: 'w-12' },
  { label: '16', className: 'w-16' },
  { label: '24', className: 'w-24' },
] as const;

function Swatch({
  name,
  className,
}: {
  name: string;
  className: string;
}) {
  return (
    <div className="space-y-2">
      <div className={`h-16 rounded-lg ${className}`} />
      <p className="text-sm font-medium">{name}</p>
    </div>
  );
}

export function OverviewPage() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-[#463176] p-7 text-white">
        <img src={`${import.meta.env.BASE_URL}tymflo-horizontal.png`} alt="TymFlo" className="mb-8 h-12 w-auto object-contain object-left" />
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f69679]">Less Work. More Flow.</p>
        <h2 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">Make more time for what matters.</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/80">A brand system for helping people and organizations work with greater capacity to grow and create.</p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Purpose', 'Make more time for what matters.'],
          ['Mission', 'Make work flow better, so people can focus on what matters.'],
          ['Brand question', 'What would you do with more time?'],
          ['Method', 'Discover → Diagnose → Test → Expand → Manage'],
        ].map(([label, text]) => (
          <article key={label} className="rounded-xl border bg-card p-5 text-card-foreground">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#463176]">{label}</p>
            <p className="mt-3 text-sm leading-6">{text}</p>
          </article>
        ))}
      </section>
      <section className="rounded-xl border bg-card p-5 text-card-foreground">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Less Work. More Flow.</p>
        <h2 className="mt-3 text-2xl font-semibold">Designed to reduce operational friction.</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Virtual-first, human-led, and technology-enabled work that reduces disconnected information, manual handoffs, delays, and strategy fatigue.
        </p>
        <div className="mt-5">
          <Guidelines items={[
            { kind: 'do', text: 'Lead with clarity, momentum, and a sense of possibility.' },
            { kind: 'do', text: 'Use human judgment, clear process, and technology together.' },
            { kind: 'dont', text: 'Add complexity or visual noise that creates more operational friction.' },
          ]} />
        </div>
      </section>
      <section className="rounded-xl border bg-card p-5 text-card-foreground">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Core palette
        </h2>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {CORE_SWATCHES.map((swatch) => (
            <Swatch key={swatch.name} {...swatch} />
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5 text-card-foreground">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Typography
          </h2>
          <div className="mt-4 space-y-3">
            {TYPE_SCALE.map((entry) => (
              <p key={entry.label} className={entry.className}>
                {entry.label}
              </p>
            ))}
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5 text-card-foreground">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            In use
          </h2>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Create workspace</CardTitle>
              <CardDescription>
                Components composed from the tokens above.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="overview-name">Workspace name</Label>
                <Input id="overview-name" placeholder="Enter a name" />
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked id="overview-notify" />
                <Label htmlFor="overview-notify">Email notifications</Label>
                <Badge className="ml-auto">New</Badge>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button>Save</Button>
              <Button variant="outline">Cancel</Button>
            </CardFooter>
          </Card>
        </section>
      </div>

      <section className="space-y-4 rounded-xl border bg-card p-5 text-card-foreground">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Components
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Badge>Badge</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </section>
    </div>
  );
}

export function ColorsPage() {
  return (
    <div className="space-y-8 rounded-xl border bg-card p-6 text-card-foreground">
      <section className="space-y-4">
        <div>
          <h2 className="font-semibold">Brand colors</h2>
          <p className="text-sm text-muted-foreground">
            The core roles used for emphasis, supporting actions, and accents.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {CORE_SWATCHES.map((swatch) => (
            <Swatch key={swatch.name} {...swatch} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-semibold">Semantic and surface colors</h2>
          <p className="text-sm text-muted-foreground">
            Roles for text, backgrounds, borders, muted content, and danger.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {SUPPORTING_SWATCHES.map((swatch) => (
            <Swatch key={swatch.name} {...swatch} />
          ))}
        </div>
      </section>
    </div>
  );
}

export function TintsPage() {
  const tints = [
    ['TymFlo Purple', '#463176'],
    ['Purple 80%', '#625584'],
    ['Purple 60%', '#7d7192'],
    ['Purple 40%', '#9b94ad'],
    ['Purple 20%', '#c4c2cf'],
    ['Atomic Tangerine', '#F69679'],
    ['Tangerine 80%', '#f8a48c'],
    ['Tangerine 60%', '#fab6a2'],
    ['Tangerine 40%', '#fbd0c2'],
    ['Tangerine 20%', '#fde8e2'],
  ];
  return (
    <div className="space-y-8 rounded-xl border bg-card p-6 text-card-foreground">
      <section>
        <h2 className="font-semibold">Secondary, tertiary, and supporting colors</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Almond, Tea Rose, African Violet, and Lapis Lazuli support the primary palette. Harvest Gold and Dark Purple add emphasis without overpowering the core colors.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {SUPPORTING_SWATCHES.slice(2, 8).map((swatch) => <Swatch key={swatch.name} {...swatch} />)}
        </div>
      </section>
      <section className="border-t pt-6">
        <h2 className="font-semibold">Tints</h2>
        <p className="mt-2 text-sm text-muted-foreground">Created by adding white to the base palette for more pastel and less intense applications.</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {tints.map(([name, color]) => (
            <div key={name}>
              <div className="h-16 rounded-lg" style={{ backgroundColor: color }} />
              <p className="mt-2 text-xs font-medium">{name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function FontsPage() {
  return (
    <div className="space-y-8 rounded-xl border bg-card p-6 text-card-foreground">
      <section>
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Font family
        </h2>
        <p className="mt-4 text-4xl font-bold" style={{ fontFamily: '"Montserrat Local", Montserrat, sans-serif' }}>HOW TO MAKE MORE TIME</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Montserrat Bold / Semi Bold is the primary display and heading face.
        </p>
      </section>

      <section className="space-y-4 border-t pt-6">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Type scale
        </h2>
        {TYPE_SCALE.map((entry) => (
          <div key={entry.label} className="grid gap-2 sm:grid-cols-[88px_1fr]">
            <span className="pt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {entry.label}
            </span>
            <p
              className={entry.className}
              style={{
                fontFamily: entry.label === 'Display' || entry.label === 'Heading'
                  ? '"Montserrat Local", Montserrat, sans-serif'
                  : '"Spectral Local", Spectral, Georgia, serif',
              }}
            >
              {entry.label === 'Display' ? 'MAKE MORE TIME' : 'Build products people understand.'}
            </p>
          </div>
        ))}
        <div className="grid gap-3 border-t pt-6">
          <p className="text-2xl italic" style={{ fontFamily: '"Spectral Local", Spectral, Georgia, serif' }}>Make work flow better.</p>
          <p className="text-5xl text-primary" style={{ fontFamily: '"Better Sabrina", cursive' }}>12345</p>
          <p className="text-sm text-muted-foreground">Spectral Medium Italic adds elegance to subheads; Better Sabrina is reserved for numbers and key figures.</p>
        </div>
      </section>
    </div>
  );
}

export function LayoutPage() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border bg-card p-6 text-card-foreground">
        <h2 className="font-semibold">Spacing</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The spacing scale, derived from the base spacing token.
        </p>
        <div className="mt-6 space-y-4">
          {SPACING_SCALE.map((space) => (
            <div key={space.label} className="flex items-center gap-4">
              <span className="w-8 text-xs text-muted-foreground">
                {space.label}
              </span>
              <div className={`h-3 rounded-full bg-primary ${space.className}`} />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6 text-card-foreground">
        <h2 className="font-semibold">Radius</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Corner treatments derive from the base radius token.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {[
            { label: 'Small', className: 'rounded-sm' },
            { label: 'Medium', className: 'rounded-md' },
            { label: 'Large', className: 'rounded-lg' },
            { label: 'Extra large', className: 'rounded-xl' },
          ].map((radius) => (
            <div
              key={radius.label}
              className={`flex h-24 items-end border bg-muted p-3 ${radius.className}`}
            >
              <span className="text-xs font-medium">{radius.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
