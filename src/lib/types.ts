export type SectionType = 'hero' | 'video_gallery' | 'contact' | 'text_block';

export interface Section {
  id: string;
  type: SectionType;
  content: any;
  isVisible: boolean;
  sortOrder: number;
}
