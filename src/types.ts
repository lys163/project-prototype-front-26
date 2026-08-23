export type IllustrationStyle = 'watercolor' | 'oil' | 'sketch' | '3d' | 'anime';

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  pages: Page[];
  category: string;
  likes: number;
  length: string;
  language: string;
  format: string;
  rating: number;
  reviews: Review[];
}

export interface Page {
  id: string;
  text: string;
  imageUrl: string;
  pageNumber: number;
}

export interface Review {
  id: string;
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface StoryWizardState {
  pageCount: number;
  style: IllustrationStyle;
  prompt: string;
  title: string;
}
