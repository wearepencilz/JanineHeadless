import { getSettings } from '@/lib/db';

export default async function SiteFooter() {
  const settings = await getSettings().catch(() => ({}));
  const logo: string = settings?.logo || '';
  const companyName: string = settings?.companyName || 'Janine';
  const visit = settings?.visit || {};

  const days = visit.days || 'THU / FRI / SAT';
  const hours = visit.hours || '13H – 20H';
  const hoursNote = visit.hoursNote || 'SOMETIMES LATER';
  const addressLine1 = visit.addressLine1 || '2455 rue Notre Dame Ouest';
  const addressLine2 = visit.addressLine2 || 'Montreal, H3J 1N6';
  const instagram: string = settings?.socialLinks?.instagram || 'https://instagram.com/janinemtl';
  const email: string = settings?.email || 'bonjour@janinemtl.ca';
  const phone: string = settings?.phone || '514.970.9266';

  return (
    <footer id="visit" className="relative w-full bg-white overflow-hidden pt-16">
      {/* Footer info row */}
      <div
        className="flex justify-between px-8 pb-16 text-[#333112] text-[16px] leading-[22px] tracking-[0.48px]"
        style={{ fontFamily: 'var(--font-neue-montreal)', fontWeight: 400 }}
      >
        <address className="not-italic">
          {addressLine1}<br />
          {addressLine2}
        </address>

        <div className="lowercase">
          <p>{days}</p>
          <p>
            {hours} –{' '}
            <em style={{ fontStyle: 'italic' }}>{hoursNote}</em>
          </p>
        </div>

        <a href={instagram} className="hover:opacity-60 transition-opacity">
          instagram
        </a>

        <div>
          <p>{email}</p>
          <p>{phone}</p>
        </div>
      </div>

      {/* Big logo */}
      <div className="w-full flex items-end justify-center overflow-hidden">
        {logo ? (
          <img
            src={logo}
            alt={companyName}
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
