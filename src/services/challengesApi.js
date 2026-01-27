import api from './api';

export const challengesApi = {
    getAll: async () => {
        const response = await api.get('/challenges/');
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/challenges/${id}/`);
        return response.data;
    },
    getBySlug: async (slug) => {
        const response = await api.get(`/challenges/${slug}/`);
        return response.data;
    },
    submit: async (slug, data) => {
        const response = await api.post(`/challenges/${slug}/submit/`, data);
        return response.data;
    },
    unlockHint: async (slug, hintOrder) => {
        const response = await api.post(`/challenges/${slug}/unlock_hint/`, { hint_order: hintOrder });
        return response.data;
    },
    purchaseAIHint: async (slug) => {
        const response = await api.post(`/challenges/${slug}/purchase_ai_assist/`);
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/challenges/', data);
        return response.data;
    },
    update: async (slug, data) => {
        const response = await api.patch(`/challenges/${slug}/`, data);
        return response.data;
    },
    delete: async (slug) => {
        const response = await api.delete(`/challenges/${slug}/`);
        return response.data;
    },
    claimCertificate: async () => {
        const response = await api.post('/certificates/claim/');
        return response.data;
    },
    verifyCertificate: async (id) => {
        // Public endpoint
        const response = await api.get(`/certificates/verify/${id}/`);
        return response.data;
    }
};
