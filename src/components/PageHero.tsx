interface PageHeroProps {
  icon?: React.ReactNode;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  titleAccent?: string;
}

export default function PageHero({ icon, eyebrow, title, subtitle, titleAccent }: PageHeroProps) {
  return (
    <section
      className="relative pt-32 pb-20 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1a3a6e 0%, #1565c0 60%, #0288d1 100%)' }}
    >
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-sky-600/8 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {icon && (
          <div className="inline-flex w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-400/20 items-center justify-center mb-6">
            <span className="text-sky-400">{icon}</span>
          </div>
        )}
        {eyebrow && (
          <p className="section-label-dark justify-center mb-4">
            <span className="w-5 h-px bg-sky-500" />
            {eyebrow}
            <span className="w-5 h-px bg-sky-500" />
          </p>
        )}
        <h1 className="font-display font-bold text-white text-4xl sm:text-5xl lg:text-6xl mb-5 leading-tight text-balance">
          {title}
          {titleAccent && (
            <> <span className="gradient-text">{titleAccent}</span></>
          )}
        </h1>
        {subtitle && (
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
