export default function AboutSection() {
  return (
    <section className="relative w-full h-[854px] bg-[#948c22] overflow-hidden">
      {/* Right image placeholder */}
      <div className="absolute right-0 top-0 w-[742px] h-full bg-[#7a7318] opacity-60" />

      {/* Text content */}
      <div className="absolute left-[46px] top-[57px] w-[400px]">
        <p
          className="text-white text-[18px] leading-[22px] mb-8"
          style={{ fontFamily: 'var(--font-neue-montreal)', fontWeight: 400 }}
        >
          Handcraft soft serve mediterranean gelato, made with the heart and honesty.
          <br /><br />
          Local supplier and a research of insane flavour, so everyone can find a piece of their happy memory in each icy creation.
        </p>

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
