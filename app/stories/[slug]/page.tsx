import { notFound } from 'next/navigation';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/home/SiteFooter';
import type { StoryBlock } from '@/app/admin/components/StoryBlockBuilder';

async function getStory(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stories/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getRelatedStories(currentId: string, tags: string[]) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stories`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const all = await res.json();
    return all
      .filter((s: any) => s.id !== currentId && s.status === 'published')
      .filter((s: any) => s.tags?.some((t: string) => tags.includes(t)))
      .slice(0, 3);
  } catch {
    return [];
  }
}

function renderBlock(block: StoryBlock, i: number) {
  switch (block.type) {
    case 'text':
      return (
        <div
          key={block.id}
          className="prose prose-lg max-w-none text-[#333112] leading-[1.8]"
          style={{ fontFamily: 'var(--font-neue-montreal)' }}
          dangerouslySetInnerHTML={{ __html: block.content || '' }}
        />
      );

    case 'image': {
      const img = block.images?.[0];
      if (!img?.url) return null;
      const isFullBleed = block.layout === 'full-bleed';
      return (
        <figure key={block.id} className={isFullBleed ? '-mx-4 md:-mx-8' : ''}>
          <img
            src={img.url}
            alt={img.alt || ''}
            className={`w-full object-cover ${isFullBleed ? 'aspect-[16/7]' : 'aspect-[16/9]'}`}
          />
          {img.caption && (
            <figcaption
              className="mt-2 text-[#333112]/40 text-[12px] tracking-[0.24px]"
              style={{ fontFamily: 'var(--font-diatype-mono)' }}
            >
              {img.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case 'image-grid': {
      const cols = block.layout === '3-col' ? 'grid-cols-3' : 'grid-cols-2';
      return (
        <div key={block.id} className={`grid ${cols} gap-3`}>
          {(block.images || []).filter((img) => img.url).map((img, j) => (
            <figure key={j}>
              <img src={img.url} alt={img.alt || ''} className="w-full aspect-square object-cover" />
              {img.caption && (
                <figcaption
                  className="mt-1.5 text-[#333112]/40 text-[11px]"
                  style={{ fontFamily: 'var(--font-diatype-mono)' }}
                >
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      );
    }

    case 'video': {
      if (!block.videoUrl) return null;
      // Convert YouTube/Vimeo to embed
      let embedUrl = block.videoUrl;
      if (embedUrl.includes('youtube.com/watch')) {
        const id = new URL(embedUrl).searchParams.get('v');
        embedUrl = `https://www.youtube.com/embed/${id}`;
      } else if (embedUrl.includes('youtu.be/')) {
        const id = embedUrl.split('youtu.be/')[1];
        embedUrl = `https://www.youtube.com/embed/${id}`;
      } else if (embedUrl.includes('vimeo.com/')) {
        const id = embedUrl.split('vimeo.com/')[1];
        embedUrl = `https://player.vimeo.com/video/${id}`;
      }
      return (
        <figure key={block.id}>
          <div className="aspect-video w-full overflow-hidden">
            <iframe src={embedUrl} className="w-full h-full" allowFullScreen title="Video" />
          </div>
          {block.videoCaption && (
            <figcaption
              className="mt-2 text-[#333112]/40 text-[12px] tracking-[0.24px]"
              style={{ fontFamily: 'var(--font-diatype-mono)' }}
            >
              {block.videoCaption}
            </figcaption>
          )}
        </figure>
      );
    }

    case 'quote':
      return (
        <blockquote key={block.id} className="border-l-2 border-[#333112]/20 pl-6 py-1">
          <p
            className="text-[#333112] text-[22px] md:text-[28px] leading-[1.3] italic"
            style={{ fontFamily: 'var(--font-neue-montreal)', fontWeight: 400 }}
          >
            {block.quote}
          </p>
          {block.attribution && (
            <cite
              className="block mt-3 text-[#333112]/50 text-[12px] tracking-[0.24px] not-italic uppercase"
              style={{ fontFamily: 'var(--font-diatype-mono)' }}
            >
              {block.attribution}
            </cite>
          )}
        </blockquote>
      );

    case 'ingredient-focus':
      return (
        <div key={block.id} className="border border-[#333112]/15 p-6 space-y-3">
          <p
            className="text-[#333112]/40 text-[10px] tracking-[0.2px] uppercase"
            style={{ fontFamily: 'var(--font-diatype-mono)' }}
          >
            Ingredient
          </p>
          <p
            className="text-[#333112] text-[24px] leading-[1.1] uppercase"
            style={{ fontFamily: 'var(--font-neue-montreal)', fontWeight: 700 }}
          >
            {block.ingredient}
          </p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 pt-2">
            {block.origin && (
              <div>
                <p className="text-[#333112]/40 text-[10px] uppercase tracking-[0.2px]" style={{ fontFamily: 'var(--font-diatype-mono)' }}>Origin</p>
                <p className="text-[#333112] text-[14px]" style={{ fontFamily: 'var(--font-neue-montreal)' }}>{block.origin}</p>
              </div>
            )}
            {block.season && (
              <div>
                <p className="text-[#333112]/40 text-[10px] uppercase tracking-[0.2px]" style={{ fontFamily: 'var(--font-diatype-mono)' }}>Season</p>
                <p className="text-[#333112] text-[14px]" style={{ fontFamily: 'var(--font-neue-montreal)' }}>{block.season}</p>
              </div>
            )}
          </div>
          {block.why && (
            <p
              className="text-[#333112]/70 text-[14px] leading-[1.7] pt-1"
              style={{ fontFamily: 'var(--font-neue-montreal)' }}
            >
              {block.why}
            </p>
          )}
        </div>
      );

    case 'word-by':
      return (
        <div key={block.id} className="flex items-center gap-3 py-2">
          <div className="h-px flex-1 bg-[#333112]/10" />
          <p
            className="text-[#333112]/50 text-[11px] tracking-[0.22px] uppercase"
            style={{ fontFamily: 'var(--font-diatype-mono)' }}
          >
            Word by {block.author}{block.role ? `, ${block.role}` : ''}
          </p>
          <div className="h-px flex-1 bg-[#333112]/10" />
        </div>
      );

    case 'divider':
      return <div key={block.id} className="h-px bg-[#333112]/10" />;

    default:
      return null;
  }
}

export default async function StoryPage({ params }: { params: { slug: string } }) {
  const story = await getStory(params.slug);
  if (!story || story.status !== 'published') notFound();

  const related = await getRelatedStories(story.id, story.tags || []);

  return (
    <main className="bg-white min-h-screen">
      <SiteHeader />

      {/* Hero */}
      {story.coverImage && (
        <div className="w-full aspect-[16/7] overflow-hidden">
          <img
            src={story.coverImage}
            alt={story.coverImageAlt || story.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="px-4 md:px-8 max-w-3xl mx-auto pt-12 pb-24">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-10">
          <Link
            href="/stories"
            className="text-[#333112]/40 text-[11px] tracking-[0.22px] uppercase hover:text-[#333112] transition-colors"
            style={{ fontFamily: 'var(--font-diatype-mono)' }}
          >
            Stories
          </Link>
          {story.category && (
            <>
              <span className="text-[#333112]/20 text-[11px]">/</span>
              <span
                className="text-[#333112]/40 text-[11px] tracking-[0.22px] uppercase"
                style={{ fontFamily: 'var(--font-diatype-mono)' }}
              >
                {story.category.replace(/-/g, ' ')}
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h1
          className="text-[#333112] text-[36px] md:text-[56px] leading-[1.0] uppercase mb-6"
          style={{ fontFamily: 'var(--font-neue-montreal)', fontWeight: 700 }}
        >
          {story.title}
        </h1>

        {/* Intro */}
        {story.intro && (
          <p
            className="text-[#333112]/70 text-[18px] leading-[1.6] mb-8 max-w-xl"
            style={{ fontFamily: 'var(--font-neue-montreal)', fontWeight: 400 }}
          >
            {story.intro}
          </p>
        )}

        {/* Word by */}
        {story.wordBy && (
          <p
            className="text-[#333112]/40 text-[11px] tracking-[0.22px] uppercase mb-12"
            style={{ fontFamily: 'var(--font-diatype-mono)' }}
          >
            Word by {story.wordBy}{story.wordByRole ? `, ${story.wordByRole}` : ''}
          </p>
        )}

        {/* Blocks */}
        <div className="space-y-10">
          {(story.blocks || []).map((block: StoryBlock, i: number) => renderBlock(block, i))}
        </div>

        {/* Tags */}
        {story.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-16 pt-8 border-t border-[#333112]/10">
            {story.tags.map((tag: string) => (
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

        {/* Share */}
        <div className="mt-12 pt-8 border-t border-[#333112]/10 flex items-center gap-6">
          <p
            className="text-[#333112]/40 text-[11px] tracking-[0.22px] uppercase"
            style={{ fontFamily: 'var(--font-diatype-mono)' }}
          >
            Share
          </p>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(story.title)}&url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/stories/${story.slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#333112]/40 text-[11px] tracking-[0.22px] uppercase hover:text-[#333112] transition-colors"
            style={{ fontFamily: 'var(--font-diatype-mono)' }}
          >
            X / Twitter
          </a>
          <a
            href={`https://www.instagram.com/`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#333112]/40 text-[11px] tracking-[0.22px] uppercase hover:text-[#333112] transition-colors"
            style={{ fontFamily: 'var(--font-diatype-mono)' }}
          >
            Instagram
          </a>
        </div>
      </div>

      {/* Related stories */}
      {related.length > 0 && (
        <div className="border-t border-[#333112]/10 px-4 md:px-8 py-16">
          <p
            className="text-[#333112]/40 text-[11px] tracking-[0.22px] uppercase mb-10"
            style={{ fontFamily: 'var(--font-diatype-mono)' }}
          >
            Related stories
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10 max-w-5xl">
            {related.map((s: any) => (
              <Link key={s.id} href={`/stories/${s.slug}`} className="group block">
                {s.coverImage && (
                  <div className="overflow-hidden mb-4">
                    <img
                      src={s.coverImage}
                      alt={s.coverImageAlt || s.title}
                      className="w-full aspect-[4/3] object-cover group-hover:scale-[1.02] transition-transform duration-700"
                    />
                  </div>
                )}
                <h3
                  className="text-[#333112] text-[18px] leading-[1.1] uppercase"
                  style={{ fontFamily: 'var(--font-neue-montreal)', fontWeight: 700 }}
                >
                  {s.title}
                </h3>
                {s.intro && (
                  <p
                    className="text-[#333112]/60 text-[13px] leading-[1.6] mt-1 line-clamp-2"
                    style={{ fontFamily: 'var(--font-neue-montreal)' }}
                  >
                    {s.intro}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      <SiteFooter />
    </main>
  );
}
