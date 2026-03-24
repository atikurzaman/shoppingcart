import api from './api';

export interface Blog {
    id: number;
    title: string;
    slug: string;
    content: string;
    shortDescription?: string;
    thumbnailUrl?: string;
    categoryId: number;
    isPublished: boolean;
    publishedAt?: string;
    category?: { id: number; name: string };
    createdAt: string;
}

export interface StaticPage {
    id: number;
    title: string;
    slug: string;
    content: string;
    isPublished: boolean;
    createdAt: string;
}

export interface Seller {
    id: number;
    userId: number;
    storeName: string;
    slug: string;
    storeDescription?: string;
    storeLogo?: string;
    balance: number;
    isApproved: boolean;
    isActive: boolean;
    commissionRate: number;
    createdAt: string;
}

export const cmsApi = {
    getBlogs: async () => {
        const response = await api.get('/api/cms/blogs');
        return response.data;
    },
    createBlog: async (data: Partial<Blog>) => {
        const response = await api.post('/api/cms/blogs', data);
        return response.data;
    },
    getPages: async () => {
        const response = await api.get('/api/cms/pages');
        return response.data;
    },
    createPage: async (data: Partial<StaticPage>) => {
        const response = await api.post('/api/cms/pages', data);
        return response.data;
    }
};

export const vendorApi = {
    getSellers: async () => {
        const response = await api.get('/api/vendors');
        return response.data;
    },
    createSeller: async (data: Partial<Seller>) => {
        const response = await api.post('/api/vendors', data);
        return response.data;
    }
};
