import { getSettings } from '@/lib/db';

export default async function PhotoPanels() {
  const settings = await getSettings().catch(() => ({}));
  const photos = (settings as any)?.home?.photos || {};
  const photo1: string = photos.photo1 || '';
  const photo2: string = photos.photo2 || '';

  return (
    <section className="flex gap-4 px-8 py-16">
      <div className="flex-none w-[680px] h-[863px] bg-[#dad5bb] overflow-hidden">
        {photo1 && <img src={photo1} alt="" className="w-full h-full object-cover" />}
      </div>
      <div className="flex-none w-[681px] h-[721px] bg-[#dad5bb] overflow-hidden self-start">
        {photo2 && <img src={photo2} alt="" className="w-full h-full object-cover" />}
      </div>
    </section>
  );
}
