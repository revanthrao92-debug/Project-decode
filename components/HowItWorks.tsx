const steps = [
  {
    n: "01",
    title: "Pick a place",
    body: "Tap a country on the globe, drag it round, or type a city. Every border is a door.",
  },
  {
    n: "02",
    title: "See what's moving",
    body: "The last 48 hours of reporting from that region, pulled from outlets that actually cover it.",
  },
  {
    n: "03",
    title: "Get the decode",
    body: "Explainers that answer the question the headline leaves out: why does this matter to you?",
  },
];

export default function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-14 lg:px-8 lg:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-line pt-8">
        <h2 className="display text-[clamp(1.9rem,3.4vw,2.8rem)]">
          How a decode works
        </h2>
        <p className="max-w-xs text-sm leading-relaxed text-ink-soft">
          Three steps. No doomscrolling, no algorithm deciding what you should
          care about.
        </p>
      </div>

      <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
        {steps.map((step) => (
          <li key={step.n} className="border-t-2 border-ink pt-4">
            <span className="display block text-[1.6rem] text-ink">{step.n}</span>
            <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
