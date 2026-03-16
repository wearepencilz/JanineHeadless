import Image from 'next/image';
import { getSettings } from '@/lib/db';

export default async function SiteFooter() {
  const settings = await getSettings().catch(() => ({}));
  const logo: string = settings?.logo || '';
  const companyName: string = settings?.companyName || 'Janine';

  return (
    <footer id="visit" className="relative w-full bg-white overflow-hidden pt-16">
      {/* Footer info row */}
      <div
        className="flex justify-between px-8 pb-16 text-[#333112] text-[16px] leading-[22px] tracking-[0.48px]"
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
            <em style={{ fontStyle: 'italic' }}>SOMETIMES LATER</em>
          </p>
        </div>

        <a href="https://instagram.com/janinemtl" className="hover:opacity-60 transition-opacity">
          instagram
        </a>

        <div>
          <p>bonjour@janinemtl.ca</p>
          <p>514.970.9266</p>
        </div>
      </div>

      {/* Big logo */}
      <div className="w-full flex items-end justify-center overflow-hidden">
        {logo ? (
          <Image
            src={logo}
            alt={companyName}
            width={1440}
            height={306}
            className="w-full object-contain object-bottom"
          />
        ) : (
          <p
            className="text-[#333112] text-[clamp(60px,12vw,180px)] leading-none tracking-tight select-none pb-0"
            style={{ fontFamily: 'var(--font-neue-montreal)', fontWeight: 700 }}
            aria-hidden="true"
          >
            {companyName}
          </p>
        )}
      </div>
    </footer>
  );
}
