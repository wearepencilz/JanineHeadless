// Placeholder archive entries — will be replaced with CMS data
const entries = [
  { name: 'Wild Blueberry & Spruce Tips', date: '20 September 2025', number: '001', highlight: false },
  { name: 'Wild Blueberry & Spruce Tips', date: '20 September 2025', number: '001', highlight: true },
  { name: 'Wild Blueberry & Spruce Tips', date: '20 September 2025', number: '001', highlight: false },
  { name: 'Wild Blueberry & Spruce Tips', date: '20 September 2025', number: '001', highlight: false },
  { name: 'Wild Blueberry & Spruce Tips', date: '20 September 2025', number: '001', highlight: false },
  { name: 'Wild Blueberry & Spruce Tips', date: '20 September 2025', number: '001', highlight: false },
  { name: 'Wild Blueberry & Spruce Tips', date: '20 September 2025', number: '001', highlight: false },
  { name: 'Wild Blueberry & Spruce Tips', date: '20 September 2025', number: '001', highlight: false },
  { name: 'Wild Blueberry & Spruce Tips', date: '20 September 2025', number: '001', highlight: false },
];

export default function ArchiveSection() {
  return (
    <section id="archive" className="px-8 py-16">
      <p
        className="text-[#333112] text-[16px] tracking-[0.32px] mb-6"
        style={{ fontFamily: 'var(--font-diatype-mono)', fontWeight: 500 }}
      >
        [ARCHIVE]
      </p>

      <div className="flex flex-col">
        {entries.map((entry, i) => (
          <div key={i}>
            <div className="h-px bg-[#333112] opacity-20" />
            <div
              className="flex items-center justify-between py-4 text-[14px] tracking-[0.28px] uppercase leading-none"
              style={{
                fontFamily: 'var(--font-diatype-mono)',
                fontWeight: 500,
                color: entry.highlight ? '#948c22' : '#333112',
              }}
            >
              <span className="w-[459px]">{entry.name}</span>
              <span className="whitespace-nowrap">{entry.date}</span>
              <span className="whitespace-nowrap">{entry.number}</span>
            </div>
          </div>
        ))}
        <div className="h-px bg-[#333112] opacity-20" />
      </div>
    </section>
  );
}
