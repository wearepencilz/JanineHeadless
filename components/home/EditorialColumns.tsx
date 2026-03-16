const columns = [
  {
    bg: '#dad5bb',
    text: `For our inspiration our chef kept her habit from the south to go directly to the market to source the best flavours of perfectly ripped season fruits.\n\nThe fruits are the main character in the creation process and we pair the fruit sorbet with a creamy jersey cow milk based gelato infused with spices or native herbs that will marry perfectly and balanced the acidity or the overly sweet power of fruit.`,
  },
  {
    bg: '#dad5bb',
    text: `Our jersey milk comes from MC dairy, a coop from small farmer that provide a great environment for cow, that spend their summer in pasture for incredible product with ethical animal care value.\n\nAn Ontario-based producer, offers "Naturally Golden Yolks" eggs from free-run hens fed a diet containing marigold petals, which are rich in lutein for eye health.`,
  },
  {
    bg: '#e8e4d0',
    text: `All our supplier are selected for their locality (when season allowed) and that care about the product and the well being of the planet and animal.\n\nOur main supplier is mediserre, a small Montreal base supplier on the rise created by two chef, Andrew and Olivier that provide the best product from small Canadian producer.`,
  },
];

export default function EditorialColumns() {
  return (
    <section className="flex flex-col gap-4 px-[252px] py-16">
      {columns.map((col, i) => (
        <div key={i} className="flex gap-16">
          {/* Image placeholder */}
          <div
            className="flex-none w-[578px] h-[702px] overflow-hidden"
            style={{ background: col.bg }}
          />
          {/* Text */}
          <div className="flex items-center">
            <p
              className="text-[#333112] text-[14px] leading-[22px] w-[399px]"
              style={{ fontFamily: 'var(--font-neue-montreal)', fontWeight: 400 }}
            >
              {col.text.split('\n\n').map((para, j) => (
                <span key={j}>
                  {para}
                  {j < col.text.split('\n\n').length - 1 && <><br /><br /></>}
                </span>
              ))}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
