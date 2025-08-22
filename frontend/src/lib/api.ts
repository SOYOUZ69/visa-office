import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error(
      "API Error:",
      error.config?.url,
      error.response?.status,
      error.message
    );
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

// Meta API
export const metaAPI = {
  getClientStatuses: async () => {
    const response = await api.get("/api/v1/meta/client-statuses");
    return response.data;
  },
  getVisaTypes: async () => {
    const response = await api.get("/api/v1/meta/visa-types");
    return response.data;
  },
  getAttachmentTypes: async () => {
    const response = await api.get("/api/v1/meta/attachment-types");
    return response.data;
  },
  getServiceTypes: async () => {
    const response = await api.get("/api/v1/meta/service-types");
    return response.data;
  },
  getPaymentOptions: async () => {
    const response = await api.get("/api/v1/meta/payment-options");
    return response.data;
  },
  getPaymentModalities: async () => {
    const response = await api.get("/api/v1/meta/payment-modalities");
    return response.data;
  },
};

// Clients API
export const clientsAPI = {
  create: async (data: any) => {
    const response = await api.post("/api/v1/clients", data);
    return response.data;
  },
  getAll: async (params?: any) => {
    const response = await api.get("/api/v1/clients", { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/api/v1/clients/${id}`);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.patch(`/api/v1/clients/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/api/v1/clients/${id}`);
    return response.data;
  },
  addFamilyMember: async (clientId: string, data: any) => {
    const response = await api.post(
      `/api/v1/clients/${clientId}/family-members`,
      data
    );
    return response.data;
  },
  removeFamilyMember: async (id: string) => {
    const response = await api.delete(`/api/v1/family-members/${id}`);
    return response.data;
  },
};

// Attachments API
export const attachmentsAPI = {
  upload: async (clientId: string, file: File, type: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const response = await api.post(
      `/api/v1/clients/${clientId}/attachments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
  getByClient: async (clientId: string) => {
    const response = await api.get(`/api/v1/clients/${clientId}/attachments`);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/api/v1/attachments/${id}`);
    return response.data;
  },
  download: async (id: string) => {
    const response = await api.get(`/api/v1/attachments/${id}/file`, {
      responseType: "blob",
    });
    return response.data;
  },
};

// Services API
export const servicesAPI = {
  getClientServices: async (clientId: string) => {
    const response = await api.get(`/api/v1/clients/${clientId}/services`);
    return response.data;
  },
  createService: async (clientId: string, data: any) => {
    const response = await api.post(
      `/api/v1/clients/${clientId}/service`,
      data
    );
    return response.data;
  },
  createManyServices: async (clientId: string, data: any) => {
    const response = await api.post(
      `/api/v1/clients/${clientId}/services`,
      data
    );
    return response.data;
  },
  updateService: async (serviceId: string, data: any) => {
    const response = await api.patch(`/api/v1/services/${serviceId}`, data);
    return response.data;
  },
  deleteService: async (serviceId: string) => {
    const response = await api.delete(`/api/v1/services/${serviceId}`);
    return response.data;
  },
  getLastPrice: async (
    serviceType: string
  ): Promise<{ unitPrice: number | null }> => {
    const response = await api.get(
      `/api/v1/services/last-price?serviceType=${serviceType}`
    );
    return response.data;
  },
  getLastPrices: async (
    serviceTypes: string[]
  ): Promise<{ [key: string]: number | null }> => {
    const response = await api.post(
      "/api/v1/services/last-prices",
      serviceTypes
    );
    return response.data;
  },
};

// Payments API
export const paymentsAPI = {
  getClientPayments: async (clientId: string) => {
    const response = await api.get(`/api/v1/clients/${clientId}/payments`);
    return response.data;
  },
  createPayment: async (clientId: string, data: any) => {
    const response = await api.post(
      `/api/v1/clients/${clientId}/payment`,
      data
    );
    return response.data;
  },
  updatePayment: async (paymentId: string, data: any) => {
    const response = await api.patch(`/api/v1/payments/${paymentId}`, data);
    return response.data;
  },
  deletePayment: async (paymentId: string) => {
    const response = await api.delete(`/api/v1/payments/${paymentId}`);
    return response.data;
  },
  markInstallmentAsPaid: async (installmentId: string, caisseId?: string) => {
    const params = caisseId ? { caisseId } : {};
    const response = await api.post(
      `/api/v1/installments/${installmentId}/mark-paid`,
      null,
      { params }
    );
    return response.data;
  },
  getPaymentStatistics: async () => {
    const response = await api.get("/api/v1/payments/statistics");
    return response.data;
  },
};

// Financial API
export const financialAPI = {
  // Caisse management
  getCaisses: async () => {
    const response = await api.get("/api/v1/financial/caisses");
    return response.data;
  },
  createCaisse: async (data: any) => {
    const response = await api.post("/api/v1/financial/caisses", data);
    return response.data;
  },
  updateCaisse: async (id: string, data: any) => {
    const response = await api.put(`/api/v1/financial/caisses/${id}`, data);
    return response.data;
  },
  deleteCaisse: async (id: string) => {
    const response = await api.delete(`/api/v1/financial/caisses/${id}`);
    return response.data;
  },

  // Transaction management
  getTransactions: async (filters?: any) => {
    const response = await api.get("/api/v1/financial/transactions", {
      params: filters,
    });
    return response.data;
  },
  createTransaction: async (data: any) => {
    const response = await api.post("/api/v1/financial/transactions", data);
    return response.data;
  },

  // Transaction approval
  getPendingTransactions: async () => {
    const response = await api.get("/api/v1/financial/transactions/pending");
    return response.data;
  },
  approveTransaction: async (transactionId: string, approvedBy: string) => {
    const response = await api.post(
      `/api/v1/financial/transactions/${transactionId}/approve`,
      {
        approvedBy,
      }
    );
    return response.data;
  },
  rejectTransaction: async (
    transactionId: string,
    approvedBy: string,
    rejectionReason: string
  ) => {
    const response = await api.post(
      `/api/v1/financial/transactions/${transactionId}/reject`,
      {
        approvedBy,
        rejectionReason,
      }
    );
    return response.data;
  },
  getTransactionById: async (transactionId: string) => {
    const response = await api.get(
      `/api/v1/financial/transactions/${transactionId}`
    );
    return response.data;
  },

  // Financial reports
  getFinancialReports: async () => {
    const response = await api.get("/api/v1/financial/reports");
    return response.data;
  },
  generateFinancialReport: async (startDate: string, endDate: string) => {
    const response = await api.post(
      "/api/v1/financial/reports/generate",
      null,
      {
        params: { startDate, endDate },
      }
    );
    return response.data;
  },
};

// Employees API
export const employeesAPI = {
  getAll: async () => {
    const response = await api.get("/api/v1/employees");
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post("/api/v1/employees", data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/api/v1/employees/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/api/v1/employees/${id}`);
    return response.data;
  },
};
