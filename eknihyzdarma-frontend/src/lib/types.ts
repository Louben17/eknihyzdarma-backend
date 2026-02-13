export interface StrapiImage {
  id: number;
  url: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
}

export interface StrapiFile {
  id: number;
  name: string;
  url: string;
  mime: string;
  size: number;
}

export interface Author {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  bio?: string;
  photo?: StrapiImage;
}

export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
}

export interface Book {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description?: string;
  isFree: boolean;
  cover?: StrapiImage;
  ebookFiles?: StrapiFile[];
  author?: Author;
  category?: Category;
}

export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
