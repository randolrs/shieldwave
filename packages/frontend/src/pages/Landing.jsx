import { useNavigate } from 'react-router-dom';

const CARRIERS = ['Coterie', 'Travelers', 'Nationwide', 'biBERK', 'Liberty Mutual'];

const STEPS = [
  { num: '01', title: 'Answer 8 questions', desc: 'Quick intake built for pressure washing contractors. No insurance jargon.' },
  { num: '02', title: 'Compare quotes instantly', desc: 'We shop multiple carriers in real time. See rates side-by-side in seconds.' },
  { num: '03', title: 'Get your COI today', desc: 'Bind your policy and get your Certificate of Insurance delivered immediately.' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="font-display font-bold text-2xl tracking-tight">
          SHIELD<span className="text-volt">WAVE</span>
        </div>
        <button onClick={() => navigate('/get-quote')} className="btn-primary text-sm py-2 px-5">
          Get My Quote
        </button>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-16 pb-20 max-w-4xl mx-auto text-center">
        <div className="inline-block bg-navy-900 border border-navy-700 px-4 py-1.5 mb-6">
          <span className="text-volt font-mono text-sm font-medium">INSURANCE FOR PRESSURE WASHING PROS</span>
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] mb-6 tracking-tight">
          Get Insured in<br />
          <span className="text-volt">10 Minutes.</span><br />
          COI in Hand Today.
        </h1>
        <p className="text-navy-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          General liability, commercial property, workers comp — quoted and bound online.
          Built specifically for exterior cleaning contractors.
        </p>
        <button onClick={() => navigate('/get-quote')} className="btn-primary text-xl py-5 px-12">
          Get My Quote →
        </button>
        <p className="text-navy-500 text-sm mt-4">No credit card required to see rates</p>
      </section>

      {/* Carrier Trust Bar */}
      <section className="border-y border-navy-800 py-8">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-navy-500 text-sm text-center mb-5 font-mono uppercase tracking-widest">
            Backed by top-rated carriers
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {CARRIERS.map((c) => (
              <span key={c} className="text-navy-400 font-display font-semibold text-lg">
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-14">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step) => (
            <div key={step.num} className="card">
              <span className="font-mono text-volt text-sm font-bold">{step.num}</span>
              <h3 className="font-display text-xl font-bold mt-3 mb-2">{step.title}</h3>
              <p className="text-navy-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Coverage Types */}
      <section className="px-6 py-20 bg-navy-900/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
            Coverage Built for Your Trade
          </h2>
          <p className="text-navy-400 text-center mb-12 max-w-2xl mx-auto">
            We know pressure washing risks — chemical overspray, property damage, slip-and-fall.
            Your policy is tailored, not generic.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'General Liability', desc: 'Covers property damage, bodily injury, and advertising injury claims from your work.' },
              { title: 'Business Owners Policy', desc: 'Bundles GL with commercial property coverage for your equipment and workspace.' },
              { title: 'Workers Compensation', desc: 'Required if you have employees. Covers medical costs and lost wages for job injuries.' },
              { title: 'Commercial Auto', desc: 'Covers your trucks, trailers, and equipment while in transit to job sites.' },
              { title: 'Pollution Liability', desc: 'Critical if you use chemicals. Covers cleanup costs and third-party damage claims.' },
              { title: 'Umbrella / Excess', desc: 'Extra protection above your primary limits. Often required for commercial contracts.' },
            ].map((item) => (
              <div key={item.title} className="card">
                <h3 className="font-display font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-navy-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
          Stop Overpaying.<br />
          <span className="text-volt">Start in 2 Minutes.</span>
        </h2>
        <button onClick={() => navigate('/get-quote')} className="btn-primary text-xl py-5 px-12">
          Get My Quote →
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-navy-800 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-display font-bold text-lg">
            SHIELD<span className="text-volt">WAVE</span>
          </div>
          <p className="text-navy-500 text-sm text-center">
            ShieldWave Insurance Services. Licensed insurance producer.
            Not available in all states.
          </p>
        </div>
      </footer>
    </div>
  );
}
