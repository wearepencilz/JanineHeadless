import { getSettings } from '@/lib/db';

export default async function AboutSection() {
  const settings = await getSettings().catch(() => ({}));
  const about = (settings as any)?.about || {};

  const bg: string = about.bg || '#948c22';
  const text: string = about.text || 'Handcraft soft serve mediterranean gelato, made with the heart and honesty.<br /><br />Local supplier and a research of insane flavour, so everyone can find a piece of their happy memory in each icy creation.';
  const image: string = about.image || '';

  return (
    <section className="relative w-full h-[854px] overflow-hidden" style={{ backgroundColor: bg }}>
      {/* Right image */}
      <div className="absolute right-0 top-0 w-[742px] h-full overflow-hidden">
        {image ? (
          <img src={image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full opacity-60" style={{ backgroundColor: bg }} />
        )}
      </div>

      {/* Text content */}
      <div className="absolute left-[46px] top-[57px] w-[400px]">
        <div
          className="text-white text-[18px] leading-[22px] mb-8 [&_p]:mb-4 [&_p:last-child]:mb-0"
          style={{ fontFamily: 'var(--font-neue-montreal)', fontWeight: 400 }}
          dangerouslySetInnerHTML={{ __html: text }}
        />

        <p
          className="text-white text-[18px] leading-[22px]"
          style={{ fontFamily: 'var(--font-diatype-mono)', fontWeight: 500 }}
        >
          [ ABOUT ]
        </p>
      </div>
    </section>
  );
}
