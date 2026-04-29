'use client'

import { useState, useEffect, useRef } from 'react'
import { Menu11Icon, Cancel01Icon, ArrowRight01Icon } from 'hugeicons-react'

type ApplicationStatus = 'applied' | 'screening' | 'interview' | 'offer' | 'rejected'

// function useScrolled(threshold = 20) {
//   const [scrolled, setScrolled] = useState(false)
//   useEffect(() => {
//     const handler = () => setScrolled(window.scrollY > threshold)
//     window.addEventListener('scroll', handler, { passive: true })
//     return () => window.removeEventListener('scroll', handler)
//   }, [threshold])
//   return scrolled
// }

function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold)
    
    // Check immediately on mount
    handler() 
    
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [threshold])
  return scrolled
}

function useFadeIn(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return { ref, visible }
}

function FadeIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useFadeIn()
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} ${className}`}
    >
      {children}
    </div>
  )
}

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  applied:   'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50',
  screening: 'bg-violet-50 text-violet-700 border-violet-200/80 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800/50',
  interview: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50',
  offer:     'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50',
  rejected:  'bg-zinc-100 text-zinc-500 border-zinc-200/80 dark:bg-zinc-800/40 dark:text-zinc-500 dark:border-zinc-700/50',
}

function Pill({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-mono font-medium ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  )
}

function FAQRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-zinc-200/60 dark:border-zinc-800/60">
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-5 text-left gap-6 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
      >
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
          {q}
        </span>
        {/* <ChevronDoubleCloseFreeIcons
          aria-hidden
          className={`w-4 h-4 shrink-0 text-zinc-400 dark:text-zinc-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        /> */}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-48 pb-5' : 'max-h-0'}`}>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{a}</p>
      </div>
    </div>
  )
}

const HERO_APPS: { company: string; role: string; status: ApplicationStatus; applied: string; next: string }[] = [
  { company: 'Stripe',    role: 'Software Engineer, Payments',    status: 'interview', applied: '2025-01-14', next: 'Technical interview Jan 28' },
  { company: 'Vercel',    role: 'Frontend Engineer',              status: 'screening', applied: '2025-01-16', next: 'HR screen Jan 22' },
  { company: 'Linear',    role: 'Product Engineer',               status: 'applied',   applied: '2025-01-18', next: 'Follow up Feb 1' },
  { company: 'Anthropic', role: 'Software Engineer, Safety',      status: 'offer',     applied: '2025-01-08', next: 'Deadline Feb 3' },
  { company: 'Datadog',   role: 'Backend Engineer',               status: 'rejected',  applied: '2025-01-10', next: '—' },
  { company: 'Notion',    role: 'Full Stack Engineer',            status: 'applied',   applied: '2025-01-19', next: 'Follow up Jan 26' },
]

const KANBAN_COLS = [
  {
    label: 'Applied', dot: 'bg-blue-500',
    cards: [
      { company: 'Notion', role: 'Full Stack Eng.', date: 'Jan 19' },
      { company: 'Linear', role: 'Product Eng.',    date: 'Jan 18' },
      { company: 'Figma',  role: 'SWE, Editor',    date: 'Jan 17' },
    ],
  },
  {
    label: 'Screening', dot: 'bg-violet-500',
    cards: [
      { company: 'Vercel', role: 'Frontend Eng.', date: 'Jan 16' },
      { company: 'Loom',   role: 'Backend Eng.',  date: 'Jan 12' },
    ],
  },
  {
    label: 'Interview', dot: 'bg-amber-500',
    cards: [
      { company: 'Stripe', role: 'Payments SWE', date: 'Jan 14' },
      { company: 'Retool', role: 'SWE',          date: 'Jan 11' },
    ],
  },
  {
    label: 'Offer', dot: 'bg-emerald-500',
    cards: [
      { company: 'Anthropic', role: 'Safety Eng.', date: 'Jan 8' },
    ],
  },
]

const CHART_WEEKS = [
  { label: 'W49', apps: 8,  responses: 2 },
  { label: 'W50', apps: 12, responses: 4 },
  { label: 'W51', apps: 6,  responses: 1 },
  { label: 'W1',  apps: 11, responses: 5 },
  { label: 'W2',  apps: 10, responses: 4 },
]
const CHART_MAX = Math.max(...CHART_WEEKS.map(w => w.apps))

const CHECKLIST = [
  { done: true,  task: 'Review distributed systems notes' },
  { done: true,  task: 'Practice rate-limiter design' },
  { done: false, task: 'Prepare questions for interviewer' },
  { done: false, task: 'Test mic and camera' },
]

const FAQ_ITEMS = [
  {
    q: 'Can I import from a Google Sheet I\'ve been using?',
    a: 'Yes. Export your sheet as CSV, then go to Settings → Import. We map common column names automatically — company, role, date applied, status. Takes about 30 seconds.',
  },
  {
    q: 'Does this work for non-tech jobs?',
    a: 'Fully. The tracker is role-agnostic. Default pipeline stages work for any industry. You can rename stages and add custom fields to fit your search.',
  },
  {
    q: 'What happens to my data if I Cancel01Icon Pro?',
    a: 'You keep everything. Downgrading to Free doesn\'t delete data — you just lose Pro features. Export a full JSON or CSV backup any time from Settings → Export.',
  },
  {
    q: 'Can I export everything?',
    a: 'Yes. Settings → Export gives you a full CSV or JSON of all applications, notes, and timeline events. No vendor lock-in.',
  },
  {
    q: 'Do you have a Chrome extension?',
    a: 'In beta. The extension lets you log an application directly from a job posting on LinkedIn, Greenhouse, or Lever. Request early access from your dashboard.',
  },
  {
    q: 'Is there a referral tracker?',
    a: 'Yes. Tag any application with a referrer and track whether referred applications convert better. The analytics page breaks this out separately so you can see if your referral network is actually helping.',
  },
]

export default function Page() {
  const scrolled = useScrolled()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">

      {/* ── Nav ── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800/60'
            : ''
        }`}
      >
        <nav className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-medium tracking-tight text-zinc-900 dark:text-zinc-100 select-none">
            Tracksy
          </span>

          <div className="hidden md:flex items-center gap-7">
            {['Features', 'Pricing', 'Changelog', 'Docs'].map(link => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="#" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Sign in
            </a>
            <a
              href="#"
              className="text-sm px-3 py-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors font-medium"
            >
              Start tracking
            </a>
          </div>

          <button
            className="md:hidden p-2 text-zinc-500 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <Cancel01Icon className="w-5 h-5" aria-hidden /> : <Menu11Icon className="w-5 h-5" aria-hidden />}
          </button>
        </nav>

        {menuOpen && (
          <div className="md:hidden border-t border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 px-6 py-5 flex flex-col gap-4">
            {['Features', 'Pricing', 'Changelog', 'Docs'].map(link => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                onClick={() => setMenuOpen(false)}
              >
                {link}
              </a>
            ))}
            <div className="flex items-center gap-3 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <a href="#" className="text-sm text-zinc-500 dark:text-zinc-400">Sign in</a>
              <a href="#" className="text-sm px-3 py-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium">
                Start tracking
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="pt-28 pb-20 md:pt-36 md:pb-28 max-w-6xl mx-auto px-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 rounded-full px-3 py-1 mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" aria-hidden />
            Now in beta — free to join
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.08] text-zinc-900 dark:text-zinc-50 mb-5">
            Stop losing track<br className="hidden sm:block" /> of applications.
          </h1>

          <p className="text-base md:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8 max-w-xl">
            A focused tracker for the 100+ applications you'll send this season — with deadline reminders, status pipelines, and response analytics.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-sm font-medium transition-colors"
            >
              Start free <ArrowRight01Icon className="w-3.5 h-3.5" aria-hidden />
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 text-sm font-medium transition-colors"
            >
              See it in action
            </a>
          </div>
        </div>

        {/* Product shot — application table */}
        <div className="mt-14 overflow-x-auto rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
          <table className="w-full min-w-[680px] text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200/60 dark:border-zinc-800/60">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Company</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono">Applied</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Next step</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-zinc-950">
              {HERO_APPS.map((app, i) => (
                <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors cursor-default">
                  <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200">{app.company}</td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 max-w-52 truncate">{app.role}</td>
                  <td className="px-4 py-3"><Pill status={app.status} /></td>
                  <td className="px-4 py-3 text-zinc-400 dark:text-zinc-500 font-mono text-xs">{app.applied}</td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 text-xs">{app.next}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2.5 border-t border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between">
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">6 of 47 applications</span>
            <button className="text-xs text-amber-600 dark:text-amber-500 font-medium hover:underline underline-offset-2 transition-colors">
              View all →
            </button>
          </div>
        </div>
      </section>

      {/* ── Why this exists ── */}
      <section className="border-t border-zinc-200/60 dark:border-zinc-800/60 py-24">
        <FadeIn className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-6">
              Why Tracksy
            </p>
            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
              Spreadsheets fall apart by week two. Notion is three hours of setup for a tracker you'll maintain for four months. You forget which companies ghosted you. Deadlines slip. You can't tell if your resume is working or if it's a numbers game. There's no good middle ground between a sticky note and a full ATS.
            </p>
            <ul className="space-y-3.5" role="list">
              {[
                'Log an application in under 10 seconds',
                'See exactly which stage every application is in',
                'Get reminded 48 hours before a follow-up is due',
                'Know your response rate by role type and company size',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="text-amber-500 font-mono mt-0.5 shrink-0" aria-hidden>▸</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>
      </section>

      {/* ── Feature showcase ── */}
      <section id="features" className="border-t border-zinc-200/60 dark:border-zinc-800/60 py-24">
        <div className="max-w-6xl mx-auto px-6 space-y-28 md:space-y-36">

          {/* F1 — Pipeline */}
          <FadeIn>
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">
                  Pipeline view
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
                  Know where every application stands.
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  A kanban board built for job searching, not sprint planning. Move cards as you hear back. Nothing falls through.
                </p>
              </div>

              {/* Kanban mockup */}
              <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-900/40 p-4 overflow-x-auto">
                <div className="flex gap-3 min-w-[440px]">
                  {KANBAN_COLS.map(col => (
                    <div key={col.label} className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-3">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${col.dot}`} aria-hidden />
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate">{col.label}</span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-600 ml-auto shrink-0">{col.cards.length}</span>
                      </div>
                      <div className="space-y-2">
                        {col.cards.map(card => (
                          <div
                            key={card.company}
                            className="bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 rounded-lg p-2.5 cursor-default hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
                          >
                            <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 leading-tight">{card.company}</p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-tight mt-0.5 truncate">{card.role}</p>
                            <p className="text-xs text-zinc-300 dark:text-zinc-600 font-mono mt-2">{card.date}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* F2 — Analytics */}
          <FadeIn delay={50}>
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              {/* Chart mockup — left */}
              <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-900/40 p-5 order-2 md:order-1">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-5">Response rate by week</p>

                <div className="flex items-end gap-3 h-28">
                  {CHART_WEEKS.map(week => (
                    <div key={week.label} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end gap-px h-24">
                        <div
                          className="flex-1 bg-zinc-200 dark:bg-zinc-700 rounded-sm transition-all"
                          style={{ height: `${(week.apps / CHART_MAX) * 100}%` }}
                          aria-label={`${week.apps} applications`}
                        />
                        <div
                          className="flex-1 bg-amber-400 dark:bg-amber-500 rounded-sm transition-all"
                          style={{ height: `${(week.responses / CHART_MAX) * 100}%` }}
                          aria-label={`${week.responses} responses`}
                        />
                      </div>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">{week.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-zinc-200 dark:bg-zinc-700" aria-hidden />
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">Applied</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 dark:bg-amber-500" aria-hidden />
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">Responses</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60">
                  {[
                    { label: 'Applied',    value: '47' },
                    { label: 'Responses',  value: '12' },
                    { label: 'Interviews', value: '3'  },
                    { label: 'Offers',     value: '1'  },
                  ].map(stat => (
                    <div key={stat.label} className="text-center">
                      <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 font-mono leading-tight">{stat.value}</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-1 md:order-2">
                <p className="text-xs font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">
                  Analytics
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
                  See if your resume is actually working.
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Track response rates week over week. Break down by company size, role type, or referral source. Stop guessing whether it's you or the market.
                </p>
              </div>
            </div>
          </FadeIn>

          {/* F3 — Deadlines */}
          <FadeIn delay={50}>
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">
                  Deadline reminders
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
                  Never forget a follow-up again.
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Set follow-up dates when you apply. Tracksy reminds you 48 hours before, with a pre-written template you can edit. No more "wait, did I hear back from them?"
                </p>
              </div>

              {/* Reminders mockup */}
              <div className="space-y-3">
                <div className="rounded-xl border border-amber-200/60 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 p-4">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs font-mono text-amber-600 dark:text-amber-500 mb-1">in 2 days</p>
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Stripe — Technical Interview</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Jan 28, 2:00 PM EST · Systems Design</p>
                    </div>
                    <Pill status="interview" />
                  </div>

                  <div className="pt-3 border-t border-amber-200/40 dark:border-amber-800/40">
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2.5">Prep checklist</p>
                    <div className="space-y-2">
                      {CHECKLIST.map(item => (
                        <div key={item.task} className="flex items-center gap-2 text-xs">
                          <span
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 text-xs leading-none ${
                              item.done
                                ? 'bg-amber-500 border-amber-500 text-white'
                                : 'border-zinc-300 dark:border-zinc-600'
                            }`}
                            aria-hidden
                          >
                            {item.done ? '✓' : ''}
                          </span>
                          <span className={item.done ? 'text-zinc-400 dark:text-zinc-500 line-through' : 'text-zinc-600 dark:text-zinc-300'}>
                            {item.task}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 mb-1">in 5 days</p>
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Anthropic — Offer deadline</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Feb 3 · Respond or negotiate</p>
                    </div>
                    <Pill status="offer" />
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="border-t border-zinc-200/60 dark:border-zinc-800/60 py-24">
        <FadeIn className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">Pricing</p>
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Simple. No annual lock-in.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-2xl">
            {/* Free */}
            <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 p-6 bg-white dark:bg-zinc-900/40">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Free</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">$0</span>
                <span className="text-sm text-zinc-400 dark:text-zinc-500">/month</span>
              </div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-5">for casual job searches</p>

              <a
                href="#"
                className="block w-full text-center px-4 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors mb-6"
              >
                Get started
              </a>

              <ul className="space-y-2.5" role="list">
                {[
                  'Up to 50 active applications',
                  'Pipeline view (kanban board)',
                  'Basic deadline reminders via email',
                  'CSV export',
                  '30-day activity history',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-500 dark:text-zinc-400">
                    <span className="font-mono text-zinc-300 dark:text-zinc-600 mt-0.5 shrink-0" aria-hidden>—</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="rounded-xl border border-amber-200/60 dark:border-amber-800/60 p-6 bg-amber-50/30 dark:bg-amber-950/10 relative">
              <span className="absolute top-4 right-4 text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 font-medium border border-amber-200/60 dark:border-amber-800/60">
                Popular
              </span>

              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Pro</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">$6</span>
                <span className="text-sm text-zinc-400 dark:text-zinc-500">/month</span>
              </div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-5">for serious job seekers</p>

              <a
                href="#"
                className="block w-full text-center px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors mb-6"
              >
                Start free trial →
              </a>

              <ul className="space-y-2.5" role="list">
                {[
                  'Unlimited applications',
                  'Everything in Free',
                  'Response analytics and rate tracking',
                  'AI-generated follow-up emails (GPT-4o)',
                  'Email integration — auto-log from inbox',
                  'Chrome extension (early access)',
                  'Referral source tracking',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="text-amber-500 font-mono mt-0.5 shrink-0" aria-hidden>▸</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="border-t border-zinc-200/60 dark:border-zinc-800/60 py-24">
        <FadeIn className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">FAQ</p>
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Questions we actually get asked.
            </h2>
          </div>

          <div className="max-w-2xl">
            {FAQ_ITEMS.map(item => (
              <FAQRow key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-200/60 dark:border-zinc-800/60 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <p className="font-medium text-sm tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">Tracksy</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed max-w-48">
                A focused job application tracker for people who are serious about their search.
              </p>
            </div>

            {[
              {
                heading: 'Product',
                links: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
              },
              {
                heading: 'Company',
                links: ['About', 'Blog', 'Docs', 'Status'],
              },
              {
                heading: 'Legal',
                links: ['Privacy', 'Terms', 'Cookie policy'],
              },
            ].map(col => (
              <div key={col.heading}>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
                  {col.heading}
                </p>
                <ul className="space-y-2" role="list">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Built by a developer who got tired of losing track. →{' '}
              <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                @yourhandle
              </a>
            </p>
            <p className="text-xs text-zinc-300 dark:text-zinc-700 font-mono">© 2025 Tracksy</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
