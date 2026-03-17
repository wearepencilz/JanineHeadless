import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/home/SiteFooter';

export const metadata = {
  title: 'Stories – Janine',
  description: 'A seasonal archive of moments, ingredients, and people.',
};

async function getStories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stories`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const all = await res.json();
    return all.filter((s: any) => s.status === 'published');
  } catch {
    return [];
  }
}

export default async function StoriesPage() {
  const stories: any[] = await getStories();
  const sorted = [...stories].sort(
    (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
  );

  const [hero, ...rest] = sorted;

  return (
    <main className="bg-white min-h-screen">
      <SiteHeader />

      <div className="px-4 md:px-8 pt-[100px] md:pt-[120px] pb-24">

        {/* Label */}
        <p
          className="text-[#333112] text-[13px] tracking-[0.26px] mb-12 uppercase"
          style={{ fontFamily: 'var(--font-diatype-mono)', fontWeight: 500 }}
        >
          [Stories]
        </p>

        {sorted.length === 0 ? (
          <p className="text-[#333112]/40 text-[14px]" style={{ fontFamily: 'var(--font-neue-montreal)' }}>
            Nothing here yet.
          </p>
        ) : (
          <>
            {/* Hero story */}
            {hero && (
              <Link href={`/stories/${hero.slug}`} className="block group mb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-end">
                  {hero.coverImage && (
                    <div className="overflow-hidden">
                      <img
                        src={hero.coverImage}
                        alt={hero.coverImageAlt || hero.title}
                        className="w-full aspect-[4/3] object-cover group-hover:scale-[1.02] transition-transform duration-700"
                      />
                    </div>
                  )}
                  <div className="pb-2">
                    {hero.category && (
                      <p
                        className="text-[#333112]/40 text-[11px] tracking-[0.22px] uppercase mb-4"
                        style={{ fontFamily: 'var(--font-diatype-mono)', fontWeight: 500 }}
                      >
                        {hero.category.replace(/-/g, ' ')}
                      </p>
                    )}
                    <h2
                      className="text-[#333112] text-[36px] md:text-[52px] leading-[1.0] uppercase mb-4"
                      style={{ fontFamily: 'var(--font-neue-montreal)', fontWeight: 700 }}
                    >
                      {hero.title}
                    </h2>
                    {hero.intro && (
                      <p
                        className="text-[#333112]/60 text-[16px] leading-[1.6] max-w-sm"
                        style={{ fontFamily: 'var(--font-neue-montreal)', fontWeight: 400 }}
                      >
                        {hero.intro}
                      </p>
                    )}
                    {hero.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-6">
                        {hero.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="text-[#333112]/50 text-[11px] tracking-[0.22px] uppercase border border-[#333112]/20 px-2 py-0.5"
                            style={{ fontFamily: 'var(--font-diatype-mono)' }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )}

            {/* Story grid */}
            {rest.length > 0 && (
              <>
                <div className="h-px bg-[#333112] opacity-10 mb-12" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-14">
                  {rest.map((story: any) => (
                    <Link key={story.id} href={`/stories/${story.slug}`} className="group block">
                      {story.coverImage && (
                        <div className="overflow-hidden mb-4">
                          <img
                            src={story.coverImage}
                            alt={story.coverImageAlt || story.title}
                            className="w-full aspect-[4/3] object-cover group-hover:scale-[1.02] transition-transform duration-700"
                          />
                        </div>
                      )}
                      {story.category && (
                        <p
                          className="text-[#333112]/40 text-[10px] tracking-[0.2px] uppercase mb-2"
                          style={{ fontFamily: 'var(--font-diatype-mono)', fontWeight: 500 }}
                        >
                          {story.category.replace(/-/g, ' ')}
                        </p>
                      )}
                      <h3
                        className="text-[#333112] text-[20px] leading-[1.1] uppercase mb-2"
                        style={{ fontFamily: 'var(--font-neue-montreal)', fontWeight: 700 }}
                      >
                        {story.title}
                      </h3>
                      {story.intro && (
                        <p
                          className="text-[#333112]/60 text-[14px] leading-[1.6] line-clamp-2"
                          style={{ fontFamily: 'var(--font-neue-montreal)', fontWeight: 400 }}
                        >
                          {story.intro}
                        </p>
                      )}
                      {story.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {story.tags.slice(0, 3).map((tag: string) => (
                            <span
                              key={tag}
                              className="text-[#333112]/40 text-[10px] tracking-[0.2px] uppercase border border-[#333112]/15 px-1.5 py-0.5"
                              style={{ fontFamily: 'var(--font-diatype-mono)' }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <SiteFooter />
    </main>
  );
}
