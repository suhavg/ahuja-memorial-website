import TributeExperience from '@/components/TributeExperience';
import { getMemories } from '@/lib/db';

export const dynamic = 'force-dynamic';

const originalGallery = [
  'https://cdn.tribute-media.com/gallery/min/page-6544-4p2d880h1php1lp8p13kgi1mfj-1788987321.jpg',
  'https://cdn.tribute-media.com/gallery/min/page-6544-4p2d880h1php1lp8p13kgi1mfj-1788987300.jpg',
  'https://cdn.tribute-media.com/gallery/min/page-6544-4p2d880h1php1lp8p13kgi1mfj-1788987290.jpg',
  'https://cdn.tribute-media.com/gallery/min/page-6544-4p2d880h1php1lp8p13kgi1mfj-1788987281.jpg',
  'https://cdn.tribute-media.com/gallery/min/page-6544-4p2d880h1php1lp8p13kgi1mfj-1788987270.jpg',
  'https://cdn.tribute-media.com/gallery/min/page-6544-4p2d880h1php1lp8p13kgi1mfj-1788987262.jpg',
  'https://cdn.tribute-media.com/gallery/min/page-6544-4p2d880h1php1lp8p13kgi1mfj-1788987247.jpg',
  'https://cdn.tribute-media.com/gallery/min/page-6544-4p2d880h1php1lp8p13kgi1mfj-1788987237.jpg',
  'https://cdn.tribute-media.com/gallery/min/page-6544-4p2d880h1php1lp8p13kgi1mfj-1788987226.jpg',
  'https://cdn.tribute-media.com/gallery/min/page-6544-4p2d880h1php1lp8p13kgi1mfj-1788987217.jpg',
  'https://cdn.tribute-media.com/gallery/min/page-6544-4p2d880h1php1lp8p13kgi1mfj-1788987208.jpg',
  'https://cdn.tribute-media.com/gallery/min/page-6544-4p2d880h1php1lp8p13kgi1mfj-1788987201.jpg',
  ...Array.from(
    { length: 244 },
    (_, index) => `/gallery/memory-${String(index + 1).padStart(3, '0')}.jpg`
  ),
];

export default function HomePage() {
  const memories = getMemories();
  const submittedPhotos = memories.flatMap((memory) => memory.photos);
  const galleryPhotos = [...originalGallery, ...submittedPhotos];

  return <TributeExperience memories={memories} galleryPhotos={galleryPhotos} />;
}
