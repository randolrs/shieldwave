import { useNavigate } from 'react-router-dom';

const CARRIERS = ['Coterie', 'Travelers', 'Nationwide', 'biBERK', 'Liberty Mutual'];

const STEPS = [
  { num: '1', title: 'Answer 8 questions', desc: 'Quick intake built for pressure washing contractors. No insurance jargon, no long forms.' },
  { num: '2', title: 'Compare quotes instantly', desc: 'We shop multiple carriers in real time. See rates side-by-side in under 90 seconds.' },
  { num: '3', title: 'Get your COI today', desc: 'Bind your policy and receive your Certificate of Insurance immediately via email.' },
];

const COVERAGE = [
  { title: 'General Liability', desc: 'Covers property damage, bodily injury, and advertising injury claims from your work.', href: '/insurance/general-liability' },
  { title: 'Business Owners Policy', desc: 'Bundles GL with commercial property coverage for your equipment and workspace.', href: '/insurance/business-owners-policy' },
  { title: 'Workers Compensation', desc: 'Required if you have employees. Covers medical costs and lost wages for job injuries.', href: '/insurance/workers-compensation' },
  { title: 'Commercial Auto', desc: 'Covers your trucks, trailers, and equipment while in transit to job sites.', href: '/insurance/commercial-auto' },
  { title: 'Pollution Liability', desc: 'Critical if you use chemicals. Covers cleanup costs and third-party damage claims.', href: '/insurance/pollution-liability' },
  { title: 'Umbrella / Excess', desc: 'Extra protection above your primary limits. Often required for commercial contracts.', href: '/insurance/umbrella' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="font-display font-bold text-xl tracking-tight text-slate-900">
          shield<span className="text-brand-600">wave</span>
        </div>
        <button onClick={() => navigate('/get-quote')} className="btn-primary text-sm py-2.5 px-5">
          Get a Quote
        </button>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-20 pb-24 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 px-4 py-1.5 rounded-full mb-8 text-sm font-medium">
          Insurance for pressure washing professionals
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] mb-6 text-slate-900">
          Get insured in minutes.
          <br />
          <span className="text-brand-600">COI in hand today.</span>
        </h1>
        <p className="text-slate-500 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
          General liability, commercial property, and workers comp — quoted, bound, and delivered online. Built for exterior cleaning contractors.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => navigate('/get-quote')} className="btn-primary text-lg py-4 px-10">
            Get My Quote
          </button>
          <a href="#how-it-works" className="btn-secondary text-lg py-4 px-10">
            How It Works
          </a>
        </div>
        <p className="text-slate-400 text-sm mt-5">No credit card required to see rates</p>
      </section>

      {/* Carrier Trust Bar */}
      <section className="border-y border-slate-100 py-8 bg-slate-25">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-slate-400 text-xs text-center mb-5 font-medium uppercase tracking-widest">
            Backed by top-rated carriers
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14">
            {CARRIERS.map((c) => (
              <span key={c} className="text-slate-400 font-semibold text-base">
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            How it works
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto">
            From first question to COI in hand — the fastest path to coverage for your business.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step) => (
            <div key={step.num} className="text-center md:text-left">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold text-sm mb-4">
                {step.num}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Coverage Types */}
      <section className="px-6 py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Coverage built for your trade
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              We know pressure washing risks — chemical overspray, property damage, slip-and-fall. Your policy is tailored, not generic.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {COVERAGE.map((item) => (
              <a key={item.title} href={item.href} className="card hover:shadow-card-hover transition-shadow group block">
                <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-3">{item.desc}</p>
                <span className="text-brand-600 text-sm font-medium group-hover:underline">Learn more →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Ready to get covered?
          </h2>
          <p className="text-slate-500 mb-8">
            Join hundreds of pressure washing contractors who got insured through ShieldWave.
          </p>
          <button onClick={() => navigate('/get-quote')} className="btn-primary text-lg py-4 px-10">
            Get My Quote
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-display font-bold text-lg text-slate-900">
            shield<span className="text-brand-600">wave</span>
          </div>
          <p className="text-slate-400 text-sm text-center">
            ShieldWave Insurance Services. Licensed insurance producer. Not available in all states.
          </p>
        </div>
      </footer>
    </div>
  );
}
