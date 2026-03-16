export default function StorySection() {
  return (
    <section className="relative w-full h-[804px] bg-[#333112] overflow-hidden">
      {/* Background image placeholder */}
      <div className="absolute inset-0 bg-[#1a1a0a]" />

      {/* Story text */}
      <div
        className="absolute left-[44px] top-[66px] w-[332px] text-white text-[16px] leading-normal"
        style={{ fontFamily: 'var(--font-neue-montreal)', fontWeight: 400 }}
      >
        <p className="mb-4">
          This is the story of a lost heritage in a southern village, nestled between the azure sea and the singing cicadas. From Marseille to La Spezia.
        </p>
        <p className="mb-4">A frozen delight for the long summer days.</p>
        <p className="mb-4">
          A tribute to a grandmother who loves the sea, the warm sand, and the sweetness of a gelato. It is the story of all those little moments of happiness that belong to each of us, told through frozen flavors with simplicity and honesty.
        </p>
        <p className="mb-0">To Janine,</p>
        <p>the cicadas will forever sing your name.</p>
      </div>
    </section>
  );
}
