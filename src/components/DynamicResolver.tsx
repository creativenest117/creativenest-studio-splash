import React from 'react';
import HeroBlock from './blocks/HeroBlock';
import ContactBlock from './blocks/ContactBlock';
import { TextBlock, YouTubeBlock, SpotifyBlock, VideoBlock, GalleryBlock, LiveTVBlock, RadioBlock, LiveStreamBlock, BookingBlock } from './blocks/MediaBlocks';

interface Section {
  id: string;
  type: string;
  title?: string;
  description?: string;
  url?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  isVisible?: boolean;
  content: any;
}

export default function DynamicResolver({ sections }: { sections: Section[] }) {
  const visible = sections.filter(s => s.isVisible !== false);

  return (
    <div className="w-full flex flex-col gap-1 pb-4">
      {visible.map((section) => {
        switch (section.type) {
          case 'hero':
            return <HeroBlock key={section.id} content={section.content} />;
          case 'contact':
            return <ContactBlock key={section.id} content={section.content} />;

          // Text / Rich content
          case 'text':
          case 'text_block':
            return <TextBlock key={section.id} section={section} />;

          // Media embeds
          case 'youtube':
            return <YouTubeBlock key={section.id} section={section} />;
          case 'spotify':
            return <SpotifyBlock key={section.id} section={section} />;
          case 'video':
          case 'video_upload':
            return <VideoBlock key={section.id} section={section} />;
          case 'gallery':
          case 'image_gallery':
            return <GalleryBlock key={section.id} section={section} />;

          // Live / Broadcast
          case 'tv':
          case 'live_tv':
            return <LiveTVBlock key={section.id} section={section} />;
          case 'radio':
            return <RadioBlock key={section.id} section={section} />;
          case 'livestream':
          case 'live_stream':
            return <LiveStreamBlock key={section.id} section={section} />;

          // Booking
          case 'booking':
            return <BookingBlock key={section.id} section={section} />;

          // Legacy video gallery
          case 'video_gallery':
            return <VideoBlock key={section.id} section={section} />;

          default:
            // In production, silently skip unknown types
            return null;
        }
      })}
    </div>
  );
}
