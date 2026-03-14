import api from "./api";

let aiAnalyzeUnavailable = false;
let aiAnalyzeUnavailableUntil = 0;

export const challengesApi = {
  getAll: async () => {
    const response = await api.get("/challenges/");
    return response.data;
  },
  getBySlug: async (slug) => {
    const response = await api.get(`/challenges/${slug}/`);
    return response.data;
  },
  submit: async (slug, data = {}) => {
    const payload = { ...(data || {}), passed: true };
    const response = await api.post(
      `/challenges/${slug}/submit/?passed=true`,
      payload,
    );
    return response.data;
  },
  purchaseAIHint: async (slug) => {
    const response = await api.post(`/challenges/${slug}/purchase_ai_assist/`);
    return response.data;
  },
  getAIHint: async (slug, data) => {
    const response = await api.post(`/challenges/${slug}/ai-hint/`, data);
    return response.data;
  },
  aiAnalyze: async (slug, user_code) => {
    if (aiAnalyzeUnavailable && Date.now() < aiAnalyzeUnavailableUntil) {
      const err = new Error("AI analyze endpoint unavailable");
      err.isAnalyzeUnavailable = true;
      err.response = { status: 404 };
      throw err;
    }
    // Cooldown expired: allow retry.
    if (aiAnalyzeUnavailable && Date.now() >= aiAnalyzeUnavailableUntil) {
      aiAnalyzeUnavailable = false;
    }

    const payload = { user_code };
    const candidatePaths = [
      `/challenges/${slug}/ai-analyze/`,
      `/challenges/${slug}/ai_analyze/`,
      `/challenges/${slug}/analyze/`,
    ];

    let lastError;
    for (const path of candidatePaths) {
      try {
        const response = await api.post(path, payload);
        return response.data;
      } catch (err) {
        const statusCode = err?.response?.status;
        // Retry only for not-found/route mismatch; throw immediately for auth/server errors.
        if (statusCode !== 404) {
          throw err;
        }
        lastError = err;
      }
    }
    aiAnalyzeUnavailable = true;
    aiAnalyzeUnavailableUntil = Date.now() + 60000; // retry backend after 60s
    throw lastError || new Error("AI analyze endpoint not found");
  },
  create: async (data) => {
    const response = await api.post("/challenges/", data);
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

  // Certificate APIs
  getMyCertificate: async () => {
    const response = await api.get("/certificates/my_certificate/");
    const data = response.data;
    return data?.certificate_id ? data : null;
  },
  verifyCertificate: async (certificateId) => {
    const response = await api.get(`/certificates/verify/${certificateId}/`);
    return response.data;
  },
  checkCertificateEligibility: async () => {
    const response = await api.get("/certificates/check_eligibility/");
    return response.data;
  },
};
