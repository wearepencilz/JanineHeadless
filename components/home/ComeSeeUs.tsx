import Image from 'next/image';
import { getSettings } from '@/lib/db';

export default async function ComeSeeUs() {
  const settings = await getSettings().catch(() => ({}));
  const visit = settings?.visit || {};

  const days = visit.days || 'THU / FRI / SAT';
  const hours = visit.hours || '13H – 20H';
  const hoursNote = visit.hoursNote || 'SOMETIMES LATER';
  const addressLine1 = visit.addressLine1 || '2455 Notre Dame,';
  const addressLine2 = visit.addressLine2 || 'Montreal, QC, H3J 1N6';
  const photo = visit.photo || '';

  return (
    <section
      id="visit"
      className="relative w-full min-h-screen flex"
      style={{ backgroundColor: '#948c22' }}
    >
      {/* Left: info panel */}
      <div className="flex-1 flex flex-col justify-center px-16 py-24 relative z-10">
        <div className="mb-6">
          <p
            className="text-white text-[20px] tracking-[0.4px] leading-none uppercase mb-2"
            style={{ fontFamily: 'var(--font-diatype-mono)', fontWeight: 500 }}
          >
            {days}
          </p>
          <div className="flex items-center gap-3 text-white text-[20px] tracking-[0.4px] leading-none">
            <span style={{ fontFamily: 'var(--font-diatype-mono)', fontWeight: 500 }}>
              {hours}
            </span>
            <span
              className="italic"
              style={{ fontFamily: 'var(--font-neue-montreal)', fontWeight: 500 }}
            >
              {hoursNote}
            </span>
          </div>
        </div>

        <address
          className="not-italic text-white text-[20px] tracking-[0.4px] leading-[1.5] uppercase"
          style={{ fontFamily: 'var(--font-diatype-mono)', fontWeight: 500 }}
        >
          <p>{addressLine1}</p>
          <p>{addressLine2}</p>
        </address>
      </div>

      {/* Right: photo */}
      {photo && (
        <div className="w-1/2 relative overflow-hidden">
          <Image
            src={photo}
            alt="Janine storefront"
            fill
            className="object-cover object-center"
          />
        </div>
      )}
    </section>
  );
}
