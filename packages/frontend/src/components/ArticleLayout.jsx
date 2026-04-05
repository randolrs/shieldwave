import { useNavigate } from 'react-router-dom';

export default function ArticleLayout({ title, metaDescription, hero, children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <a href="/" className="font-display font-bold text-xl text-slate-900">
          shield<span className="text-brand-600">wave</span>
        </a>
        <button onClick={() => navigate('/get-quote')} className="btn-primary text-sm py-2.5 px-5">
          Get a Quote
        </button>
      </nav>

      {/* Hero */}
      <header className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <span className="inline-block text-brand-600 text-sm font-medium bg-brand-50 px-3 py-1 rounded-full mb-5">
            {hero}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
            {title}
          </h1>
        </div>
      </header>

      {/* Content */}
      <article className="max-w-2xl mx-auto px-6 py-12 prose-article">
        {children}
      </article>

      {/* CTA */}
      <section className="bg-brand-600 py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Get covered in minutes
          </h2>
          <p className="text-brand-100 mb-8 text-lg">
            Answer 8 quick questions and compare quotes from top carriers. COI delivered same day.
          </p>
          <button
            onClick={() => navigate('/get-quote')}
            className="bg-white text-brand-700 font-semibold px-8 py-4 rounded-lg text-lg hover:bg-brand-50 transition-colors shadow-sm"
          >
            Get My Quote
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <a href="/" className="font-display font-bold text-lg text-slate-900">
            shield<span className="text-brand-600">wave</span>
          </a>
          <p className="text-slate-400 text-sm text-center">
            ShieldWave Insurance Services. Licensed insurance producer. Not available in all states.
          </p>
        </div>
      </footer>
    </div>
  );
}
