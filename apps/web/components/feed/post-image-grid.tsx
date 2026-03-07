'use client';

import Image from 'next/image';
import type { RecordModel } from 'pocketbase';
import { getFileUrl } from '../../lib/pb-helpers';

interface PostImageGridProps {
  post: RecordModel;
}

export function PostImageGrid({ post }: PostImageGridProps) {
  const imageFiles: string[] = post.images || [];
  if (imageFiles.length === 0) return null;

  const getUrl = (filename: string) => getFileUrl(post, filename, '600x600');

  if (imageFiles.length === 1) {
    return (
      <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-lg">
        <Image
          src={getUrl(imageFiles[0])}
          alt="Post image"
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 600px"
        />
      </div>
    );
  }

  if (imageFiles.length === 2) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-lg">
        {imageFiles.map((file, i) => (
          <div key={i} className="relative aspect-square">
            <Image src={getUrl(file)} alt={`Image ${i + 1}`} fill className="object-cover" sizes="300px" />
          </div>
        ))}
      </div>
    );
  }

  if (imageFiles.length === 3) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-lg">
        <div className="relative row-span-2 aspect-[2/3]">
          <Image src={getUrl(imageFiles[0])} alt="Image 1" fill className="object-cover" sizes="300px" />
        </div>
        {imageFiles.slice(1).map((file, i) => (
          <div key={i} className="relative aspect-square">
            <Image src={getUrl(file)} alt={`Image ${i + 2}`} fill className="object-cover" sizes="300px" />
          </div>
        ))}
      </div>
    );
  }

  // 4+ images: 2x2 grid, with +N overlay on last tile if > 4
  const shown = imageFiles.slice(0, 4);
  const remaining = imageFiles.length - 4;

  return (
    <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-lg">
      {shown.map((file, i) => (
        <div key={i} className="relative aspect-square">
          <Image src={getUrl(file)} alt={`Image ${i + 1}`} fill className="object-cover" sizes="300px" />
          {i === 3 && remaining > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-2xl font-bold text-white">
              +{remaining}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
