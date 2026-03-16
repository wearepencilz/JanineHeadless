import Link from 'next/link';
import { getSettings } from '@/lib/db';

export default async function SiteHeader() {
  const settings = await getSettings().catch(() => ({}));
  const logo: string = settings?.logo || '';
  const companyName: string = settings?.companyName || 'Janine';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-start justify-between px-8 pt-8 pointer-events-none">
      {/* Logo */}
      <Link href="/" className="pointer-events-auto" aria-label={`${companyName} home`}>
        {logo ? (
          <img
            src={logo}
            alt={companyName}
            className="h-[27px] w-auto object-contain"
          />
        ) : (
          <span
            className="text-[#333112] text-sm tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-neue-montreal)', fontWeight: 500 }}
          >
            {companyName}
          </span>
        )}
      </Link>

      {/* Right nav */}
      <nav
        className="pointer-events-auto flex flex-col items-end gap-[10px] text-[#343100] text-[14px] tracking-[0.28px] uppercase leading-none"
        style={{ fontFamily: 'var(--font-diatype-mono)', fontWeight: 500 }}
      >
        <Link href="/flavours" className="hover:opacity-60 transition-opacity">Flavours</Link>
        <Link href="/stories" className="hover:opacity-60 transition-opacity">Stories</Link>
        <Link href="/visit" className="hover:opacity-60 transition-opacity">Come See Us</Link>
        <Link href="#archive" className="hover:opacity-60 transition-opacity">Archive</Link>
      </nav>
    </header>
  );
}
