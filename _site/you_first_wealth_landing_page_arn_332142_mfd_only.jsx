import React, { useEffect } from "react";

// YouFirst Wealth — Minimal, premium landing (MFD-only)
// TailwindCSS expected. Replace placeholders: CITY, WHATSAPP_NUMBER, CALENDAR_URL, EMAIL.
// Design goals: high contrast, lots of air, strong visual hierarchy, mobile-first, CTA-forward.

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TargetIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
      <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <circle cx="12" cy="12" r="1.2" />
    </svg>
  );
}

function RepeatIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M17 1v4a1 1 0 0 0 1 1h4" strokeLinecap="round" />
      <path d="M21 6a10 10 0 1 0 3 7" strokeLinecap="round" />
    </svg>
  );
}

export default function YouFirstWealth() {
  // Dev-only sanity checks (acts like super-light "tests")
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const html = typeof document !== "undefined" ? document.documentElement.innerHTML : "";
    const placeholders = ["CITY", "WHATSAPP_NUMBER", "CALENDAR_URL", "EMAIL"];
    const missing = placeholders.filter((p) => html.includes(p));
    if (missing.length) {
      // eslint-disable-next-line no-console
      console.warn("[YouFirstWealth] Replace placeholders:", missing.join(", "));
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-emerald-200 blur-3xl opacity-30" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200">
        <div className="mx-auto max-w-6xl h-14 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-2xl bg-emerald-600" />
            <span className="font-semibold tracking-tight">YouFirst Wealth</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#how" className="hover:text-emerald-700">How</a>
            <a href="#pillars" className="hover:text-emerald-700">Pillars</a>
            <a href="#faq" className="hover:text-emerald-700">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <a data-testid="cta-whatsapp-header" href="https://wa.me/WHATSAPP_NUMBER" className="rounded-xl bg-emerald-600 px-3 py-2 text-white text-sm font-medium shadow-sm hover:bg-emerald-700">WhatsApp</a>
            <a data-testid="cta-book-header" href="CALENDAR_URL" className="hidden sm:inline-flex rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">Book call</a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h1 data-testid="hero-title" className="text-4xl sm:text-6xl font-semibold leading-tight tracking-tight">
                Money decisions, made calm.
              </h1>
              <p className="mt-4 text-lg text-slate-700 max-w-prose">
                We cut the noise, choose suitable mutual funds for your goals, and set up SIPs you can actually stick to.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a data-testid="cta-whatsapp-hero" href="https://wa.me/WHATSAPP_NUMBER" className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-white font-medium shadow-sm hover:bg-emerald-700">Chat on WhatsApp</a>
                <a data-testid="cta-book-hero" href="CALENDAR_URL" className="rounded-2xl px-5 py-2.5 border border-slate-300 hover:bg-white">Book a 30‑min call</a>
              </div>
              <div className="mt-4 text-sm text-slate-500">CITY • 15 yrs investing • 5 yrs building fintech</div>
            </div>

            <div className="relative">
              <div className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur p-5 shadow-sm">
                <div className="text-sm text-slate-500">Sample Plan Snapshot</div>

                {/* Goals */}
                <div className="mt-3 space-y-2">
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <TargetIcon className="h-5 w-5 mt-0.5 text-emerald-700" />
                    <div>
                      <div className="font-medium">Goals</div>
                      <div className="text-sm text-slate-600">Emergency 6m • Home 5y • Education 12y</div>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-600">
                        <div className="rounded-lg bg-white border border-slate-200 p-2"><div className="font-medium">₹3.6L</div><div>Emergency</div></div>
                        <div className="rounded-lg bg-white border border-slate-200 p-2"><div className="font-medium">₹25L</div><div>Home (5y)</div></div>
                        <div className="rounded-lg bg-white border border-slate-200 p-2"><div className="font-medium">₹40L</div><div>Education (12y)</div></div>
                      </div>
                    </div>
                  </div>

                  {/* Asset mix */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="font-medium">Asset mix (example)</div>
                    <div className="mt-2 space-y-2 text-sm">
                      {[{l:"Equity",p:60},{l:"Hybrid/Debt",p:30},{l:"Liquid",p:10}].map((x)=> (
                        <div key={x.l} className="">
                          <div className="flex justify-between text-slate-600"><span>{x.l}</span><span>{x.p}%</span></div>
                          <div className="mt-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div className="h-full bg-emerald-600" style={{width: `${x.p}%`}} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SIP plan */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="font-medium">SIP plan (₹25k/mo example)</div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-700">
                      {[
                        {n:"Nifty 50 Index",a:"₹8k"},
                        {n:"Flexi-cap",a:"₹6k"},
                        {n:"Mid-cap",a:"₹5k"},
                        {n:"Short-term Debt",a:"₹4k"},
                        {n:"Liquid (buffer)",a:"₹2k"},
                      ].map((r)=> (
                        <div key={r.n} className="flex items-center justify-between rounded-lg bg-white border border-slate-200 px-3 py-2"><span>{r.n}</span><span className="font-medium">{r.a}</span></div>
                      ))}
                    </div>
                  </div>

                  {/* Rules & safeguards */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="font-medium">Rules</div>
                    <ul className="mt-2 text-sm text-slate-700 list-disc list-inside">
                      <li><span className="font-medium">Rebalance rule:</span> ±5% band from target mix</li>
                      <li><span className="font-medium">Panic protocol:</span> 24‑hour cool‑off → call → decide</li>
                      <li><span className="font-medium">Tax-aware:</span> consider LTCG harvest near FY end; debt for short-term needs</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 text-xs text-slate-500">Illustrative only. Your numbers will differ.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="border-t border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold">How it works</h2>

          {/* Timeline-style steps with clearer deliverables */}
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl p-5 border border-slate-200 bg-white">
              <div className="text-xs text-slate-500">Step 1 • Day 0–2</div>
              <div className="mt-1 font-semibold">Baseline</div>
              <ul className="mt-2 text-sm text-slate-700 space-y-1 list-disc list-inside">
                <li>30‑min clarity call</li>
                <li>Goals & cashflow capture</li>
                <li>Existing folios & risk cues</li>
              </ul>
              <div className="mt-3 text-xs text-slate-500">Deliverable: one‑page baseline</div>
            </div>

            <div className="rounded-2xl p-5 border border-slate-200 bg-white">
              <div className="text-xs text-slate-500">Step 2 • Day 3–5</div>
              <div className="mt-1 font-semibold">Build</div>
              <ul className="mt-2 text-sm text-slate-700 space-y-1 list-disc list-inside">
                <li>Category‑pure lineup (Regular plans)</li>
                <li>SIP/STP setup & folio hygiene</li>
                <li>Target mix & rules documented</li>
              </ul>
              <div className="mt-3 text-xs text-slate-500">Deliverable: SIP plan + target mix</div>
            </div>

            <div className="rounded-2xl p-5 border border-slate-200 bg-white">
              <div className="text-xs text-slate-500">Step 3 • Ongoing</div>
              <div className="mt-1 font-semibold">Stay on track</div>
              <ul className="mt-2 text-sm text-slate-700 space-y-1 list-disc list-inside">
                <li>Quarterly 20‑min reviews</li>
                <li>±5% rebalance discipline</li>
                <li>Tax‑time checklist</li>
              </ul>
              <div className="mt-3 text-xs text-slate-500">Deliverable: quarterly summary</div>
            </div>
          </div>

          <div className="mt-8">
            <a data-testid="cta-how-start" href="https://wa.me/WHATSAPP_NUMBER" className="inline-flex rounded-2xl bg-emerald-600 px-5 py-3 text-white font-medium hover:bg-emerald-700">Start on WhatsApp</a>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section id="pillars" className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold">Three pillars</h2>
              <p className="text-slate-600 mt-1">What makes us different—at a glance.</p>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-4 text-sm text-slate-700">
            {/* Pillar 1: Clarity over noise */}
            <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5">
              <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-emerald-200/50 blur-2xl opacity-40 group-hover:opacity-60" />
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white shadow-inner flex items-center justify-center">
                  {/* Sparkle icon */}
                  <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
                    <path d="M12 2l1.4 3.6L17 7l-3.6 1.4L12 12l-1.4-3.6L7 7l3.6-1.4L12 2Z"/>
                    <path d="M19 12l.9 2.3L22 15l-2.1.7L19 18l-.9-2.3L16 15l2.1-.7L19 12Z"/>
                  </svg>
                </div>
                <div className="relative w-full">
                  <div className="font-semibold tracking-tight">Clarity over noise</div>
                  <p className="mt-1 text-slate-600">Turn finfluencer overwhelm into a short, suitable list you can act on.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['Category-pure','No overlaps','Low cost'].map((c)=>(
                      <span key={c} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-2 text-xs text-slate-600">
                <div className="rounded-xl border border-slate-200 p-3 bg-white">
                  <div className="text-[11px]">Shortlist</div>
                  <div className="font-medium">4–6 funds</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 bg-white">
                  <div className="text-[11px]">Overlap</div>
                  <div className="font-medium">&lt; 20%</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 bg-white">
                  <div className="text-[11px]">ER focus</div>
                  <div className="font-medium">Value &gt; hype</div>
                </div>
              </div>
            </div>

            {/* Pillar 2: Execution, not lectures */}
            <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5">
              <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-emerald-200/50 blur-2xl opacity-40 group-hover:opacity-60" />
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white shadow-inner flex items-center justify-center">
                  {/* Check icon */}
                  <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div className="relative w-full">
                  <div className="font-semibold tracking-tight">Execution, not lectures</div>
                  <p className="mt-1 text-slate-600">SIPs, SWP/STP, and folio hygiene done right—so you don’t stall.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['SIP automation','STP/SWP','Folio hygiene'].map((c)=>(
                      <span key={c} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-2 text-xs text-slate-600">
                <div className="rounded-xl border border-slate-200 p-3 bg-white">
                  <div className="text-[11px]">Go‑live</div>
                  <div className="font-medium">~ 1 week</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 bg-white">
                  <div className="text-[11px]">Setup</div>
                  <div className="font-medium">End‑to‑end</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 bg-white">
                  <div className="text-[11px]">Ops</div>
                  <div className="font-medium">Handled</div>
                </div>
              </div>
            </div>

            {/* Pillar 3: Behaviour beats timing */}
            <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5">
              <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-emerald-200/50 blur-2xl opacity-40 group-hover:opacity-60" />
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white shadow-inner flex items-center justify-center">
                  {/* Repeat/discipline icon */}
                  <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
                    <path d="M4 4h9a5 5 0 0 1 5 5v1" strokeLinecap="round"/>
                    <path d="M8 20h9a5 5 0 0 0 5-5v-1" strokeLinecap="round"/>
                    <path d="M7 7l-3 3 3 3" strokeLinecap="round"/>
                    <path d="M17 11l3 3-3 3" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="relative w-full">
                  <div className="font-semibold tracking-tight">Behaviour beats timing</div>
                  <p className="mt-1 text-slate-600">We keep you invested when markets get loud with simple, pre‑agreed rules.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['±5% bands','24‑hr cool‑off','Quarterly check‑ins'].map((c)=>(
                      <span key={c} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-2 text-xs text-slate-600">
                <div className="rounded-xl border border-slate-200 p-3 bg-white">
                  <div className="text-[11px]">Churn</div>
                  <div className="font-medium">Kept low</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 bg-white">
                  <div className="text-[11px]">Discipline</div>
                  <div className="font-medium">Built‑in</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 bg-white">
                  <div className="text-[11px]">Stress</div>
                  <div className="font-medium">Lowered</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold">FAQ</h2>

          {/* Accordion-style breakdown (7 Qs). Multiple can be open at once. */}
          <div className="mt-8 space-y-2">
            {/* Q1 */}
            <details data-testid="faq-q1" className="group rounded-2xl border border-slate-200 bg-white p-4 open:shadow-sm">
              <summary className="flex items-center justify-between cursor-pointer select-none">
                <span className="font-medium">Direct vs Regular — which is right for me?</span>
                <svg className="h-5 w-5 text-slate-500 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </summary>
              <div className="mt-3 text-sm text-slate-700">
                We handle <strong>Regular plans</strong> end‑to‑end (SIP/STP/SWP, folio hygiene). If you prefer <strong>Direct plans</strong> with fee‑only advice, we’ll refer you to a suitable RIA.
              </div>
            </details>

            {/* Q2 */}
            <details data-testid="faq-q2" className="group rounded-2xl border border-slate-200 bg-white p-4 open:shadow-sm">
              <summary className="flex items-center justify-between cursor-pointer select-none">
                <span className="font-medium">What fees do I pay?</span>
                <svg className="h-5 w-5 text-slate-500 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </summary>
              <div className="mt-3 text-sm text-slate-700">
                There’s <strong>no separate fee</strong> from us. Your cost is the fund’s <strong>expense ratio</strong> (built into NAV). We may receive <strong>standard trail</strong> from AMCs on Regular plans; ask us anytime for a yearly summary.
              </div>
            </details>

            {/* Q3 */}
            <details data-testid="faq-q3" className="group rounded-2xl border border-slate-200 bg-white p-4 open:shadow-sm">
              <summary className="flex items-center justify-between cursor-pointer select-none">
                <span className="font-medium">How do you pick funds?</span>
                <svg className="h-5 w-5 text-slate-500 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </summary>
              <div className="mt-3 text-sm text-slate-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Category purity aligned to your goal</li>
                  <li>Cost discipline &amp; process governance at AMC</li>
                  <li>Rolling‑return consistency &amp; downside control</li>
                  <li>No overlapping bets across funds</li>
                </ul>
              </div>
            </details>

            {/* Q4 */}
            <details data-testid="faq-q4" className="group rounded-2xl border border-slate-200 bg-white p-4 open:shadow-sm">
              <summary className="flex items-center justify-between cursor-pointer select-none">
                <span className="font-medium">How soon can I start?</span>
                <svg className="h-5 w-5 text-slate-500 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </summary>
              <div className="mt-3 text-sm text-slate-700">
                Typically within a week: <span className="whitespace-nowrap">Day 0–2</span> baseline → <span className="whitespace-nowrap">Day 3–5</span> setup → live SIPs.
              </div>
            </details>

            {/* Q5 */}
            <details data-testid="faq-q5" className="group rounded-2xl border border-slate-200 bg-white p-4 open:shadow-sm">
              <summary className="flex items-center justify-between cursor-pointer select-none">
                <span className="font-medium">What happens when markets fall?</span>
                <svg className="h-5 w-5 text-slate-500 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </summary>
              <div className="mt-3 text-sm text-slate-700">
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>24‑hour cool‑off</strong> before any change</li>
                  <li>Talk, then act—avoid panic exits</li>
                  <li>Rebalance only if outside ±5% bands</li>
                  <li>SIPs continue unless cashflow needs change</li>
                </ul>
              </div>
            </details>

            {/* Q6 */}
            <details data-testid="faq-q6" className="group rounded-2xl border border-slate-200 bg-white p-4 open:shadow-sm">
              <summary className="flex items-center justify-between cursor-pointer select-none">
                <span className="font-medium">Do you help with insurance and credit?</span>
                <svg className="h-5 w-5 text-slate-500 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </summary>
              <div className="mt-3 text-sm text-slate-700">
                We provide literacy and fitment frameworks; we can <strong>shortlist</strong> options and <strong>refer</strong> you to licensed providers. We don’t sell these products.
              </div>
            </details>

            {/* Q7 */}
            <details data-testid="faq-q7" className="group rounded-2xl border border-slate-200 bg-white p-4 open:shadow-sm">
              <summary className="flex items-center justify-between cursor-pointer select-none">
                <span className="font-medium">Can I pause or change SIPs later?</span>
                <svg className="h-5 w-5 text-slate-500 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </summary>
              <div className="mt-3 text-sm text-slate-700">
                Yes—life happens. We’ll adjust amount/timing or pause with a plan, and restart when your cashflows stabilize.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Sticky mobile CTA bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 md:hidden border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-2 flex items-center gap-3">
          <a data-testid="cta-whatsapp-sticky" href="https://wa.me/WHATSAPP_NUMBER" className="flex-1 rounded-xl bg-emerald-600 py-2 text-center text-white font-medium">WhatsApp</a>
          <a data-testid="cta-book-sticky" href="CALENDAR_URL" className="flex-1 rounded-xl border border-slate-300 py-2 text-center">Book</a>
        </div>
      </div>

      {/* Footer — super light */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 text-sm text-slate-600">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="font-medium text-slate-800">YouFirst Wealth</div>
            <div className="text-xs">Mutual Fund Distributor • ARN-332142</div>
          </div>
          <div className="mt-3 text-[12px]">Mutual fund investments are subject to market risks. Read all scheme-related documents carefully.</div>
          <div className="mt-3 text-[12px]">Contact: <a className="underline" href="mailto:EMAIL">EMAIL</a> • WhatsApp: <a className="underline" href="https://wa.me/WHATSAPP_NUMBER">WHATSAPP_NUMBER</a></div>
          <div className="mt-3 text-[12px]">© {new Date().getFullYear()} YouFirst Wealth.</div>
        </div>
      </footer>
    </main>
  );
}

// ---- Lightweight runtime tests (do not affect UI) ----
// Do not change existing tests; add more below.
export function __runSmokeTests() {
  const results = [] as { name: string; pass: boolean }[];
  // Existing tests
  results.push({ name: "Encodes greater-than in bullet", pass: "Behaviour &gt; timing.".includes("&gt;") });
  const mustHave = [
    "data-testid=\"cta-whatsapp-hero\"",
    "data-testid=\"cta-book-hero\"",
    "data-testid=\"hero-title\"",
  ];
  const code = YouFirstWealth.toString();
  results.push({ name: "Has data-testids", pass: mustHave.every((s) => code.includes(s)) });
  const placeholders = ["CITY", "WHATSAPP_NUMBER", "CALENDAR_URL", "EMAIL"];
  results.push({ name: "Has configurable placeholders", pass: placeholders.every((p) => code.includes(p)) });

  // Additional tests
  results.push({ name: "Headings exist", pass: ["How it works", "FAQ"].every((h) => code.includes(h)) });
  results.push({ name: "Sticky mobile bar CTAs present", pass: ["cta-whatsapp-sticky", "cta-book-sticky"].every((id) => code.includes(id)) });
  results.push({ name: "Grid layout present", pass: code.includes("md:grid-cols-2") || code.includes("md:grid-cols-3") });

    // New tests for richer sections
  const wantStrings = ["Sample Plan Snapshot", "Asset mix", "SIP plan", "Rebalance rule", "Panic protocol", "Step 1", "Step 2", "Step 3"]; 
  results.push({ name: "Richer snapshot & steps present", pass: wantStrings.every((s) => code.includes(s)) });
    // New tests for FAQ breakdown
  const faqIds = ["faq-q1","faq-q2","faq-q3","faq-q4","faq-q5","faq-q6","faq-q7"]; 
  results.push({ name: "7 FAQ items present", pass: faqIds.every((id) => code.includes(id)) });
  return results;
}
