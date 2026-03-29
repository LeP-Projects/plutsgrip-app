import { Link } from "react-router-dom"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/Button"
import { ThemeToggle } from "@/components/ThemeToggle"

interface PublicStat {
  label: string
  value: string
}

interface PublicExperienceProps {
  language: string
  backLabel?: string
  backTo?: string
  eyebrow: string
  title: string
  description: string
  badge?: string
  ctaLabel?: string
  ctaTo?: string
  secondaryLabel?: string
  secondaryTo?: string
  stats?: PublicStat[]
  highlights?: string[]
  rightContent: React.ReactNode
}

export function PublicExperience({
  language,
  backLabel,
  backTo = "/",
  eyebrow,
  title,
  description,
  badge,
  ctaLabel,
  ctaTo,
  secondaryLabel,
  secondaryTo,
  stats = [],
  highlights = [],
  rightContent,
}: PublicExperienceProps) {
  return (
    <div className="public-stage min-h-screen overflow-hidden">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="glass-panel relative z-10 mb-6 flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            {backLabel ? (
              <Button variant="ghost" size="sm" asChild className="rounded-full px-3">
                <Link to={backTo}>
                  <ArrowLeft className="h-4 w-4" />
                  {backLabel}
                </Link>
              </Button>
            ) : null}

            <Link to="/" className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 shadow-inner shadow-primary/15 ring-1 ring-primary/20">
                <img src="/plutus.png" alt="PlutusGrip" className="h-7 w-7 object-contain" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                  PlutusGrip
                </p>
                <p className="font-serif text-lg font-semibold text-foreground">
                  Finance cockpit
                </p>
              </div>
            </Link>
          </div>

          <ThemeToggle language={language} />
        </header>

        <main className="relative grid flex-1 items-stretch gap-6 lg:grid-cols-[1.12fr_0.88fr]">
          <section className="glass-panel public-grid relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />

            <div className="relative flex h-full flex-col justify-between gap-8">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary">
                    {eyebrow}
                  </span>
                  {badge ? (
                    <span className="rounded-full border border-border/70 bg-background/45 px-3 py-1 text-xs text-muted-foreground">
                      {badge}
                    </span>
                  ) : null}
                </div>

                <div className="space-y-4">
                  <h1 className="max-w-3xl font-serif text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                    {title}
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                    {description}
                  </p>
                </div>

                {(ctaLabel && ctaTo) || (secondaryLabel && secondaryTo) ? (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    {ctaLabel && ctaTo ? (
                      <Button asChild size="lg" className="rounded-full px-7 shadow-lg shadow-primary/20">
                        <Link to={ctaTo}>
                          {ctaLabel}
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    ) : null}

                    {secondaryLabel && secondaryTo ? (
                      <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="rounded-full border-border/70 bg-background/45 px-7 backdrop-blur-sm"
                      >
                        <Link to={secondaryTo}>{secondaryLabel}</Link>
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="space-y-6">
                {stats.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-3xl border border-border/65 bg-background/45 px-4 py-4 backdrop-blur-md"
                      >
                        <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                          {stat.label}
                        </p>
                        <p className="mt-2 font-serif text-2xl font-semibold text-foreground">
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {highlights.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {highlights.map((highlight) => (
                      <div
                        key={highlight}
                        className="rounded-3xl border border-border/60 bg-background/35 px-4 py-4 text-sm leading-6 text-muted-foreground backdrop-blur-md"
                      >
                        {highlight}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <aside className="glass-panel relative overflow-hidden px-5 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
            <div className="relative h-full">{rightContent}</div>
          </aside>
        </main>
      </div>
    </div>
  )
}
