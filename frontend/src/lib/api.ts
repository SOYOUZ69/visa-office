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

// Dossiers API
export const dossiersAPI = {
  getAll: async () => {
    const response = await api.get("/api/v1/dossiers");
    return response.data;
  },
  getByClient: async (clientId: string) => {
    const response = await api.get(`/api/v1/dossiers?clientId=${clientId}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/api/v1/dossiers/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post("/api/v1/dossiers", data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.patch(`/api/v1/dossiers/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/api/v1/dossiers/${id}`);
    return response.data;
  },
  assignEmployee: async (
    dossierId: string,
    employeeId: string,
    role?: string
  ) => {
    const response = await api.post(
      `/api/v1/dossiers/${dossierId}/assign-employee`,
      {
        employeeId,
        role,
      }
    );
    return response.data;
  },
  unassignEmployee: async (dossierId: string, employeeId: string) => {
    const response = await api.delete(
      `/api/v1/dossiers/${dossierId}/assign-employee`,
      {
        data: { employeeId },
      }
    );
    return response.data;
  },
  getAssignedEmployees: async (dossierId: string) => {
    const response = await api.get(
      `/api/v1/dossiers/${dossierId}/assigned-employees`
    );
    return response.data;
  },
};

// Services API
export const servicesAPI = {
  getClientServices: async (clientId: string) => {
    const response = await api.get(`/api/v1/clients/${clientId}/services`);
    return response.data;
  },
  getDossierServices: async (dossierId: string) => {
    const response = await api.get(`/api/v1/dossiers/${dossierId}/services`);
    return response.data;
  },
  createService: async (data: any) => {
    const response = await api.post("/api/v1/services", data);
    return response.data;
  },
  createManyServices: async (data: any) => {
    const response = await api.post("/api/v1/services/bulk", data);
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
  getDossierPayments: async (dossierId: string) => {
    const response = await api.get(`/api/v1/dossiers/${dossierId}/payments`);
    return response.data;
  },
  createPayment: async (data: any) => {
    const response = await api.post("/api/v1/payments", data);
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
  getUnprocessedServices: async (dossierId: string) => {
    const response = await api.get(
      `/api/v1/dossiers/${dossierId}/unprocessed-services`
    );
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
    const response = await api.post("/api/v1/financial/reports/generate", {
      startDate,
      endDate,
    });
    return response.data;
  },

  // Financial statistics
  getFinancialStatistics: async (startDate?: string, endDate?: string) => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get("/api/v1/financial/statistics", { params });
    return response.data;
  },
};

// Employees API
export const employeesAPI = {
  getAll: async () => {
    const response = await api.get("/api/v1/employees");
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/api/v1/employees/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post("/api/v1/employees", data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.patch(`/api/v1/employees/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/api/v1/employees/${id}`);
    return response.data;
  },

  // Attendance management
  markAttendance: async (employeeId: string, data: any) => {
    const response = await api.post(
      `/api/v1/employees/${employeeId}/attendance`,
      data
    );
    return response.data;
  },
  getAttendance: async (
    employeeId: string,
    startDate?: string,
    endDate?: string
  ) => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get(
      `/api/v1/employees/${employeeId}/attendance`,
      { params }
    );
    return response.data;
  },

  // Commission management
  calculateCommission: async (
    employeeId: string,
    startDate?: string,
    endDate?: string
  ) => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get(
      `/api/v1/employees/${employeeId}/commission`,
      { params }
    );
    return response.data;
  },
  createCommission: async (
    employeeId: string,
    paymentId: string,
    clientId: string,
    paymentAmount: number
  ) => {
    const response = await api.post(
      `/api/v1/employees/${employeeId}/commission/create`,
      { paymentId, clientId, paymentAmount }
    );
    return response.data;
  },
  processCommission: async (employeeId: string, commissionIds?: string[]) => {
    const response = await api.post(
      `/api/v1/employees/${employeeId}/commission/process`,
      { commissionIds }
    );
    return response.data;
  },
  processSalary: async (
    employeeId: string,
    month: number,
    year: number,
    options?: {
      caisseId?: string;
      addToVirtualCaisse?: boolean;
    }
  ) => {
    const response = await api.post(
      `/api/v1/employees/${employeeId}/salary/process`,
      {
        month,
        year,
        caisseId: options?.caisseId,
        addToVirtualCaisse: options?.addToVirtualCaisse,
      }
    );
    return response.data;
  },
  calculateMonthlySoldeCoungiee: async (
    employeeId: string,
    month: number,
    year: number
  ) => {
    const response = await api.post(
      `/api/v1/employees/${employeeId}/calculate-solde`,
      {
        month,
        year,
      }
    );
    return response.data;
  },

  // Employee statistics
  getEmployeesWithStats: async () => {
    const response = await api.get("/api/v1/employees/stats/overview");
    return response.data;
  },
  getSalaryStatus: async (employeeId: string, month: number, year: number) => {
    const response = await api.get(
      `/api/v1/employees/${employeeId}/salary-status/${month}/${year}`
    );
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  // Roles management
  getRoles: async () => {
    const response = await api.get("/api/v1/admin/roles");
    return response.data;
  },
  getRole: async (id: string) => {
    const response = await api.get(`/api/v1/admin/roles/${id}`);
    return response.data;
  },
  createRole: async (data: any) => {
    const response = await api.post("/api/v1/admin/roles", data);
    return response.data;
  },
  updateRole: async (id: string, data: any) => {
    const response = await api.put(`/api/v1/admin/roles/${id}`, data);
    return response.data;
  },
  deleteRole: async (id: string) => {
    const response = await api.delete(`/api/v1/admin/roles/${id}`);
    return response.data;
  },
  updateRolePermissions: async (roleId: string, permissionIds: string[]) => {
    const response = await api.put(
      `/api/v1/admin/roles/${roleId}/permissions`,
      {
        permissionIds,
      }
    );
    return response.data;
  },

  // Permissions management
  getPermissions: async () => {
    const response = await api.get("/api/v1/admin/permissions");
    return response.data;
  },

  // Users management
  getUsers: async () => {
    const response = await api.get("/api/v1/admin/users");
    return response.data;
  },
  getUser: async (id: string) => {
    const response = await api.get(`/api/v1/admin/users/${id}`);
    return response.data;
  },
  createUser: async (data: any) => {
    const response = await api.post("/api/v1/admin/users", data);
    return response.data;
  },
  updateUser: async (id: string, data: any) => {
    const response = await api.put(`/api/v1/admin/users/${id}`, data);
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/api/v1/admin/users/${id}`);
    return response.data;
  },
  updateUserRole: async (userId: string, roleId: string) => {
    const response = await api.put(`/api/v1/admin/users/${userId}/role`, {
      roleId,
    });
    return response.data;
  },

  // System management
  getStatistics: async () => {
    const response = await api.get("/api/v1/admin/statistics");
    return response.data;
  },
  getAuditLogs: async (page?: number, limit?: number) => {
    const params: any = {};
    if (page !== undefined) params.page = page;
    if (limit !== undefined) params.limit = limit;
    const response = await api.get("/api/v1/admin/audit-logs", { params });
    return response.data;
  },
  initializeSystem: async () => {
    const response = await api.post("/api/v1/admin/initialize-system");
    return response.data;
  },
};
export const AiMicroServiceAPI = {
  getServices: async () => {
    const response = await api.get("/api/v1/ai-service/services");
    return response.data;
  },
  getCountries: async () => {
    const response = await api.get("/api/v1/ai-service/countries");
    return response.data;
  },
  getTransactions: async () => {
    const response = await api.get("/api/v1/ai-service/transactions");
    return response.data;
  },
  getAnnualGoal: async () => {
    const response = await api.get("/api/v1/ai-service/annual-goal");
    return response.data;
  },
  estimateCost: async (payload: {
    country: string;
    quantity: number;
    selectedServices: string[];
  }) => {
    const response = await api.post("/api/v1/ai-service/estimate", payload);
    return response.data;
  },
};
