export default function SiteFooter() {
  return (
    <footer id="visit" className="relative w-full bg-white overflow-hidden pt-16">
      {/* Footer info row */}
      <div
        className="flex justify-between px-8 pb-8 text-[#333112] text-[16px] leading-[22px] tracking-[0.48px]"
        style={{ fontFamily: 'var(--font-neue-montreal)', fontWeight: 400 }}
      >
        <address className="not-italic">
          2455 rue Notre Dame Ouest<br />
          Montreal, H3J 1N6
        </address>

        <div className="lowercase">
          <p>THU / FRI / SAT</p>
          <p>
            13H – 20H –{' '}
            <em className="not-italic" style={{ fontStyle: 'italic' }}>SOMETIMES LATER</em>
          </p>
        </div>

        <a href="https://instagram.com" className="hover:opacity-60 transition-opacity">
          instagram
        </a>

        <div>
          <p>bonjour@janinemtl.ca</p>
          <p>514.970.9266</p>
        </div>
      </div>

      {/* Big logo */}
      <div className="w-full px-0 pb-0">
        <p
          className="text-[#333112] text-[clamp(60px,12vw,180px)] leading-none tracking-tight text-center select-none"
          style={{ fontFamily: 'var(--font-neue-montreal)', fontWeight: 700 }}
          aria-hidden="true"
        >
          Janine
        </p>
      </div>
    </footer>
  );
}
