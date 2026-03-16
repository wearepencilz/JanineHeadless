import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/home/SiteFooter';

export const metadata = {
  title: 'Stories – Janine',
  description: 'News, updates, and stories from Janine.',
};

async function getNews() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/news`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function StoriesPage() {
  const news: any[] = await getNews();
  const sorted = [...news].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <main className="bg-white min-h-screen">
      <SiteHeader />

      <div className="px-4 md:px-8 pt-[100px] md:pt-[120px] pb-24">
        <p
          className="text-[#333112] text-[16px] tracking-[0.32px] mb-16"
          style={{ fontFamily: 'var(--font-diatype-mono)', fontWeight: 500 }}
        >
          [STORIES]
        </p>

        {sorted.length === 0 ? (
          <p
            className="text-[#333112]/40 text-[14px]"
            style={{ fontFamily: 'var(--font-neue-montreal)', fontWeight: 400 }}
          >
            Nothing here yet.
          </p>
        ) : (
          <div className="flex flex-col">
            {sorted.map((item: any, i: number) => (
              <article key={item.id}>
                <div className="h-px bg-[#333112] opacity-10" />
                <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-16 py-10">
                  {/* Left: meta */}
                  <div className="flex flex-col gap-2">
                    <p
                      className="text-[#333112]/40 text-[11px] tracking-[0.22px] uppercase"
                      style={{ fontFamily: 'var(--font-diatype-mono)', fontWeight: 500 }}
                    >
                      {new Date(item.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full aspect-[4/3] object-cover mt-4"
                      />
                    )}
                  </div>

                  {/* Right: content */}
                  <div className="flex flex-col gap-4">
                    <h2
                      className="text-[#333112] text-[24px] md:text-[32px] leading-[1.1] uppercase"
                      style={{ fontFamily: 'var(--font-neue-montreal)', fontWeight: 700 }}
                    >
                      {item.title}
                    </h2>
                    {item.content && (
                      <p
                        className="text-[#333112]/70 text-[15px] leading-[1.7] max-w-xl"
                        style={{ fontFamily: 'var(--font-neue-montreal)', fontWeight: 400 }}
                      >
                        {item.content}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
            <div className="h-px bg-[#333112] opacity-10" />
          </div>
        )}
      </div>

      <SiteFooter />
    </main>
  );
}
