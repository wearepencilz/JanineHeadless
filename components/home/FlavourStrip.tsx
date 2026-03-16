import Image from 'next/image';

interface FlavourCard {
  image: string;
  date: string;
  type: string;
  name: string;
  status?: 'available' | 'coming-soon';
}

const flavours: FlavourCard[] = [
  { image: '', date: 'May 11 – 18', type: 'Gelato', name: 'Pistachio & Cardamom', status: 'available' },
  { image: '', date: 'May 11 – 18', type: 'Sorbet', name: 'Blood Orange', status: 'available' },
  { image: '', date: 'Coming Soon', type: 'Gelato', name: 'Blood Orange', status: 'coming-soon' },
  { image: '', date: 'Coming Soon', type: 'Gelato', name: 'Blood Orange', status: 'coming-soon' },
  { image: '', date: 'Coming Soon', type: 'Gelato', name: 'Blood Orange', status: 'coming-soon' },
];

export default function FlavourStrip() {
  return (
    <section className="w-full px-8 pt-[420px] pb-16">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
        {flavours.map((f, i) => (
          <div key={i} className="flex-none w-[178px]">
            {/* Card image */}
            <div className="bg-[#f3f3f3] h-[236px] w-full overflow-hidden relative mb-4">
              {f.image && (
                <Image src={f.image} alt={f.name} fill className="object-cover" />
              )}
            </div>
            {/* Card label */}
            <div
              className="flex flex-col gap-[6px] text-[#333112] text-[12px] tracking-[0.24px] uppercase leading-none"
              style={{ fontFamily: 'var(--font-neue-montreal)', fontWeight: 500 }}
            >
              <div className="flex gap-[6px]">
                <span>{f.date}</span>
                <span>/</span>
                <span>{f.type}</span>
              </div>
              <span>{f.name}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
