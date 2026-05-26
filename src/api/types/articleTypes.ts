// Article types

export interface ArticleItem {
  id: number;
  club_id: number;
  category_id: number;
  user: string;
  lang: string;
  permalink: string;
  title: string;
  text: string;
  image: string;
  dates: string;
  time: string;
  counter: number;
  comment: number;
  front: number;
  type: number;
  islink: number;
  shortdesc: string;
  ytlink: string;
  publish: number;
  created: string;
  deleted: string | null;
  updated: string;
}

export interface ArticleResponse {
  image_url: string;
  result: ArticleItem[];
}

export interface ArticleCategoryItem {
  id: number;
  parent_id: number;
  name: string;
  desc: string;
  created: string | null;
  deleted: string | null;
  updated: string | null;
}

export interface ArticleCategoryResponse {
  result: ArticleCategoryItem[];
}

export interface ArticlePermalinkResponse {
  image_url: string;
  result: string;
}

export interface ArticleErrorResponse {
  error: string;
}

export interface ArticleListParams {
  category?: string;
  limit?: string;
  offset?: string;
}