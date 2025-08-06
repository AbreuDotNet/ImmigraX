// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  fullName: string;
  role: string;
  expiresAt: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: string;
}

// User Types
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export enum UserRole {
  Master = 'Master',
  Abogado = 'Abogado',
  Secretario = 'Secretario'
}

// Client Types
export interface Client {
  id: string;
  lawFirmId: string;
  fullName: string;
  email?: string;
  phone?: string;
  address?: string;
  processType: string;
  caseNumber?: string;
  processStatus?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientCreateRequest {
  lawFirmId: string;
  fullName: string;
  email?: string;
  phone?: string;
  address?: string;
  processType: string;
  caseNumber?: string;
  processStatus?: string;
  notes?: string;
}

// Appointment Types
export interface Appointment {
  id: string;
  clientId: string;
  lawFirmId: string;
  title?: string;
  description?: string;
  appointmentType?: string;
  priority?: Priority;
  status: AppointmentStatus;
  appointmentDate: string;
  createdBy: string;
  createdAt: string;
  client?: Client;
}

export enum Priority {
  Baja = 'Baja',
  Media = 'Media',
  Alta = 'Alta'
}

export enum AppointmentStatus {
  Programada = 'Programada',
  Confirmada = 'Confirmada',
  Completada = 'Completada',
  Cancelada = 'Cancelada',
  Reprogramada = 'Reprogramada'
}

export interface AppointmentCreateRequest {
  clientId: string;
  lawFirmId: string;
  title?: string;
  description?: string;
  appointmentType?: string;
  priority?: Priority;
  appointmentDate: string;
}

// Document Types
export interface ClientDocument {
  id: string;
  clientId: string;
  documentType: string;
  fileUrl: string;
  version: number;
  uploadedBy: string;
  uploadedAt: string;
  isCurrent: boolean;
  client?: Client;
}

export interface DocumentCreateRequest {
  clientId: string;
  documentType: string;
  isCurrent?: boolean;
}

export interface DocumentUploadRequest {
  clientId: string;
  documentType: string;
  file: File;
  isCurrent?: boolean;
}

// Payment Types
export interface Payment {
  id: string;
  clientId: string;
  lawFirmId: string;
  amount: number;
  status: PaymentStatus;
  dueDate: string;
  paidDate?: string;
  description?: string;
  installmentNumber?: number;
  totalInstallments?: number;
  createdAt: string;
  client?: Client;
}

export enum PaymentStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Overdue = 'Overdue',
  Cancelled = 'Cancelled'
}

export interface PaymentCreateRequest {
  clientId: string;
  lawFirmId: string;
  amount: number;
  dueDate: string;
  description?: string;
  installmentNumber?: number;
  totalInstallments?: number;
}

// Client Notes Types
export interface ClientNote {
  id: string;
  clientId: string;
  title?: string;
  content: string;
  category?: string;
  isImportant: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  client?: Client;
}

export interface ClientNoteCreateRequest {
  clientId: string;
  title?: string;
  content: string;
  category?: string;
  isImportant?: boolean;
}

// Search Types
export interface GlobalSearchResult {
  query: string;
  page: number;
  pageSize: number;
  totalResults: number;
  clients: ClientSearchResult[];
  documents: DocumentSearchResult[];
  appointments: AppointmentSearchResult[];
  notes: NoteSearchResult[];
}

export interface ClientSearchResult {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  caseNumber?: string;
  processType?: string;
  processStatus?: string;
  createdAt: string;
  matchType: string;
}

export interface DocumentSearchResult {
  id: string;
  documentType: string;
  fileName: string;
  description?: string;
  clientName: string;
  clientId: string;
  uploadedAt: string;
  matchType: string;
}

export interface AppointmentSearchResult {
  id: string;
  title?: string;
  description?: string;
  appointmentType?: string;
  appointmentDate: string;
  status: string;
  clientName: string;
  clientId: string;
  matchType: string;
}

export interface NoteSearchResult {
  id: string;
  title?: string;
  content: string;
  category?: string;
  clientName: string;
  clientId: string;
  createdAt: string;
  isImportant: boolean;
  matchType: string;
}

export interface SearchRequest {
  query: string;
  lawFirmId?: string;
  page?: number;
  pageSize?: number;
  searchType?: string;
}

// Dashboard Types
export interface DashboardData {
  executiveSummary: ExecutiveSummary;
  performanceMetrics: PerformanceMetrics;
  alerts: Alert[];
}

export interface ExecutiveSummary {
  totalClients: number;
  activeClients: number;
  totalRevenue: number;
  pendingPayments: number;
  upcomingAppointments: AppointmentSummary[];
  casesByStatus: CaseStatusSummary[];
}

export interface PerformanceMetrics {
  completedAppointments: number;
  documentsUploaded: number;
  averageResponseHours: number;
  resolutionRate: number;
  periodRevenue: number;
}

export interface Alert {
  type: string;
  message: string;
  count?: number;
}

export interface AppointmentSummary {
  clientName: string;
  appointmentType?: string;
  appointmentDate: string;
  status: string;
}

export interface CaseStatusSummary {
  status: string;
  count: number;
}

// Law Firm Types
export interface LawFirm {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// Activity Log Types
export enum ActivityType {
  CLIENT_CREATED = 'CLIENT_CREATED',
  CLIENT_UPDATED = 'CLIENT_UPDATED',
  APPOINTMENT_SCHEDULED = 'APPOINTMENT_SCHEDULED',
  APPOINTMENT_CONFIRMED = 'APPOINTMENT_CONFIRMED',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  EMAIL_SENT = 'EMAIL_SENT',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  DOCUMENT_REVIEWED = 'DOCUMENT_REVIEWED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYMENT_REMINDER_SENT = 'PAYMENT_REMINDER_SENT',
  NOTE_ADDED = 'NOTE_ADDED',
  FORM_SENT = 'FORM_SENT',
  FORM_COMPLETED = 'FORM_COMPLETED',
  CASE_STATUS_UPDATED = 'CASE_STATUS_UPDATED',
  PHONE_CALL_MADE = 'PHONE_CALL_MADE'
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  clientId?: string;
  clientName?: string;
  activityType: ActivityType;
  description: string;
  metadata?: Record<string, any>; // Extra data like email subject, amount, etc.
  createdAt: string;
}

export interface DashboardActivitySummary {
  recentActivities: ActivityLog[];
  totalActivitiesToday: number;
  mostActiveClient: string;
  activityBreakdown: {
    type: ActivityType;
    count: number;
  }[];
}
