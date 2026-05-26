import axios from 'axios';
import {
  BASE_URL,
  ENDPOINT_ARTICLE,
  ENDPOINT_ARTICLE_CATEGORY,
  ENDPOINT_ARTICLE_GET_PERMALINK,
} from './constants';
import type {
  ArticleResponse,
  ArticleCategoryResponse,
  ArticlePermalinkResponse,
  ArticleListParams,
  ArticleErrorResponse,
} from './types/articleTypes';

const articleAxios = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const articleApi = {
  getArticles: async (
    params: ArticleListParams = {},
  ): Promise<ArticleResponse> => {
    const defaultParams = {
      category: '',
      limit: '10',
      offset: '0',
    };
    const payload = { ...defaultParams, ...params };

    const response = await articleAxios.post<ArticleResponse>(
      ENDPOINT_ARTICLE,
      payload,
    );
    return response.data;
  },

  getArticleCategories: async (): Promise<ArticleCategoryResponse> => {
    const response = await articleAxios.get<ArticleCategoryResponse>(
      ENDPOINT_ARTICLE_CATEGORY,
    );
    return response.data;
  },

  getArticleByPermalink: async (
    permalink: string,
  ): Promise<ArticlePermalinkResponse> => {
    if (!permalink || permalink.trim() === '') {
      return Promise.reject(new Error('Permalink is required'));
    }

    try {
      const response = await articleAxios.get<ArticlePermalinkResponse>(
        `${ENDPOINT_ARTICLE_GET_PERMALINK}/${permalink}`,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data as ArticleErrorResponse | undefined;

        if (status === 400 || status === 500) {
          throw new Error(data?.error || 'Invalid request');
        }
        throw new Error(data?.error || 'Failed to fetch article');
      }
      throw error;
    }
  },
};