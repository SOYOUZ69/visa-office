export interface User {
  id: string;
  email: string;
  role: "ADMIN" | "USER";
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface PhoneNumber {
  id: string;
  number: string;
  clientId: string;
}

export interface Employer {
  id: string;
  name: string;
  position?: string;
  clientId: string;
}

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  type: "PASSPORT" | "VISA" | "PHOTO" | "DOCUMENT" | "OTHER";
  path: string;
  clientId: string;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  fullName: string;
  passportNumber: string;
  relationship?: string;
  age?: number;
  clientId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  clientType: "INDIVIDUAL" | "FAMILY" | "GROUP" | "PHONE_CALL";
  status: "NEW" | "IN_REVIEW" | "PENDING_DOCS" | "APPROVED" | "REJECTED";
  fullName: string;
  address: string;
  jobTitle?: string;
  passportNumber?: string;
  email: string;
  destination: string;
  visaType: string;
  notes?: string;
  isMinor: boolean;
  guardianFullName?: string;
  guardianCIN?: string;
  guardianRelationship?: string;
  assignedEmployeeId?: string;
  assignedEmployee?: {
    id: string;
    fullName: string;
    commissionPercentage: string;
  };
  createdAt: string;
  updatedAt: string;
  phoneNumbers: PhoneNumber[];
  employers: Employer[];
  attachments: Attachment[];
  familyMembers: FamilyMember[];
}

export interface ClientsResponse {
  data: Client[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
export interface ClientFormProps {
  clientType: Client["clientType"];
  client?: Client;
  isEdit?: boolean;
}
export interface CreateClientData {
  clientType: Client["clientType"];
  fullName: string;
  address: string;
  jobTitle?: string;
  passportNumber?: string;
  email: string;
  destination: string;
  visaType: string;
  notes?: string;
  isMinor?: boolean;
  guardianFullName?: string;
  guardianCIN?: string;
  guardianRelationship?: string;
  phoneNumbers?: { number: string }[];
  employers?: { name: string; position?: string }[];
}

export interface CreateFamilyMemberData {
  fullName: string;
  relationship: string;
  age?: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: Client["status"];
  clientType?: Client["clientType"];
}

export interface ServiceItem {
  id: string;
  clientId: string;
  serviceType: string;
  quantity: number;
  unitPrice: string;
  isProcessed: boolean;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceData {
  serviceType: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateManyServicesData {
  items: CreateServiceData[];
}

export interface UpdateServiceData {
  serviceType?: string;
  quantity?: number;
  unitPrice?: number;
}

// Payment Types
export type PaymentOption = "BANK_TRANSFER" | "CHEQUE" | "POST" | "CASH";
export type PaymentModality =
  | "FULL_PAYMENT"
  | "SIXTY_FORTY"
  | "MILESTONE_PAYMENTS";
export type InstallmentStatus = "PENDING" | "PAID";

export interface Caisse {
  id: string;
  name: string;
  type: "VIRTUAL" | "CASH" | "BANK_ACCOUNT";
  balance: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentInstallment {
  id: string;
  description: string;
  percentage: string;
  amount: string;
  dueDate: string;
  paymentOption?: PaymentOption;
  transferCode?: string;
  status: InstallmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  clientId: string;
  totalAmount: string;
  paymentOption?: PaymentOption;
  paymentModality: PaymentModality;
  transferCode?: string;
  caisseId?: string;
  caisse?: Caisse;
  installments: PaymentInstallment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentInstallmentData {
  description: string;
  percentage: number;
  amount: number;
  dueDate: string;
  paymentOption?: PaymentOption;
  transferCode?: string;
  status?: InstallmentStatus;
}

export interface CreateFamilyMemberData {
  fullName: string;
  passportNumber: string;
  relationship?: string;
  age?: number;
}

export interface CreatePaymentData {
  totalAmount: number;
  paymentOption?: PaymentOption;
  paymentModality: PaymentModality;
  transferCode?: string;
  installments: CreatePaymentInstallmentData[];
}

export interface UpdatePaymentData {
  totalAmount?: number;
  paymentOption?: PaymentOption;
  paymentModality?: PaymentModality;
  transferCode?: string;
  installments?: CreatePaymentInstallmentData[];
}

// Employee Types
export interface Employee {
  id: string;
  fullName: string;
  salaryType: "MONTHLY" | "CLIENTCOMMISSION" | "PERIODCOMMISSION";
  salaryAmount: string;
  commissionPercentage: string;
  soldeCoungiee: string;
  createdAt: string;
  updatedAt: string;
  assignedClients?: Client[];
  attendance?: Attendance[];
  currentMonthAbsences?: number;
  totalCommission?: number;
  assignedClientsCount?: number;
}

export interface CreateEmployeeData {
  fullName: string;
  salaryType: Employee["salaryType"];
  salaryAmount: number;
  commissionPercentage: string;
  soldeCoungiee?: number;
}

export interface UpdateEmployeeData {
  fullName?: string;
  salaryType?: Employee["salaryType"];
  salaryAmount?: number;
  commissionPercentage?: string;
  soldeCoungiee?: number;
}

// Attendance Types
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttendanceData {
  date: string;
  status: AttendanceStatus;
  reason?: string;
}

// Commission Types
export interface CommissionDetail {
  clientId: string;
  clientName: string;
  paymentId: string;
  paymentAmount: number;
  commissionAmount: number;
  commissionPercentage: string;
}

export interface CommissionReport {
  employeeId: string;
  employeeName: string;
  commissionPercentage: string;
  totalCommission: number;
  commissionDetails: CommissionDetail[];
  period: {
    startDate: string;
    endDate: string;
  };
}

// Unprocessed Services Types
export interface UnprocessedServicesResponse {
  services: ServiceItem[];
  totalAmount: number;
  serviceCount: number;
}

// Financial Statistics Types
export interface FinancialStatistics {
  revenue: number;
  expenses: number;
  netProfit: number;
  transactionCounts: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  caisseId: string;
  caisse: Caisse;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  category?: string;
  amount: string;
  description: string;
  reference?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" | "CANCELLED";
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
  paymentId?: string;
  payment?: Payment & { client: Client };
}
