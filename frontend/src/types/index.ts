export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER';
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
  type: 'PASSPORT' | 'VISA' | 'PHOTO' | 'DOCUMENT' | 'OTHER';
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
  clientType: 'INDIVIDUAL' | 'FAMILY' | 'GROUP' | 'PHONE_CALL';
  status: 'NEW' | 'IN_REVIEW' | 'PENDING_DOCS' | 'APPROVED' | 'REJECTED';
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

export interface CreateClientData {
  clientType: Client['clientType'];
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
  status?: Client['status'];
  clientType?: Client['clientType'];
}

export interface ServiceItem {
  id: string;
  clientId: string;
  serviceType: string;
  quantity: number;
  unitPrice: string;
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
export type PaymentOption = 'BANK_TRANSFER' | 'CHEQUE' | 'POST' | 'CASH';
export type PaymentModality = 'FULL_PAYMENT' | 'SIXTY_FORTY' | 'MILESTONE_PAYMENTS';
export type InstallmentStatus = 'PENDING' | 'PAID';

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
