import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../config';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  Client,
  ClientCreateRequest,
  Appointment,
  AppointmentCreateRequest,
  ClientDocument,
  DocumentCreateRequest,
  Payment,
  PaymentCreateRequest,
  ClientNote,
  ClientNoteCreateRequest,
  GlobalSearchResult,
  SearchRequest,
  DashboardData,
  ApiResponse
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL = API_BASE_URL;

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth Methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.api.post('/auth/login', credentials);
    const loginData = response.data;
    
    // Store token in localStorage
    localStorage.setItem('auth_token', loginData.token);
    localStorage.setItem('user_data', JSON.stringify(loginData));
    
    return loginData;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post('/auth/register', userData);
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }

  getStoredUser(): LoginResponse | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  // Client Methods
  async getClients(lawFirmId?: string): Promise<Client[]> {
    const params = lawFirmId ? { lawFirmId } : {};
    const response: AxiosResponse<Client[]> = await this.api.get('/clients', { params });
    return response.data;
  }

  async getClient(id: string): Promise<Client> {
    const response: AxiosResponse<Client> = await this.api.get(`/clients/${id}`);
    return response.data;
  }

  async createClient(clientData: ClientCreateRequest): Promise<Client> {
    const response: AxiosResponse<Client> = await this.api.post('/clients', clientData);
    return response.data;
  }

  async updateClient(id: string, clientData: Partial<ClientCreateRequest>): Promise<Client> {
    const response: AxiosResponse<Client> = await this.api.put(`/clients/${id}`, clientData);
    return response.data;
  }

  async deleteClient(id: string): Promise<void> {
    await this.api.delete(`/clients/${id}`);
  }

  // Appointment Methods
  async getAppointments(lawFirmId?: string): Promise<Appointment[]> {
    const params = lawFirmId ? { lawFirmId } : {};
    const response: AxiosResponse<Appointment[]> = await this.api.get('/appointments', { params });
    return response.data;
  }

  async getAppointment(id: string): Promise<Appointment> {
    const response: AxiosResponse<Appointment> = await this.api.get(`/appointments/${id}`);
    return response.data;
  }

  async createAppointment(appointmentData: AppointmentCreateRequest): Promise<Appointment> {
    const response: AxiosResponse<Appointment> = await this.api.post('/appointments', appointmentData);
    return response.data;
  }

  async updateAppointment(id: string, appointmentData: Partial<AppointmentCreateRequest>): Promise<Appointment> {
    const response: AxiosResponse<Appointment> = await this.api.put(`/appointments/${id}`, appointmentData);
    return response.data;
  }

  async deleteAppointment(id: string): Promise<void> {
    await this.api.delete(`/appointments/${id}`);
  }

  async confirmAppointment(id: string, confirmed: boolean): Promise<void> {
    await this.api.post(`/appointments/${id}/confirm`, confirmed);
  }

  // Document Methods
  async getDocuments(clientId?: string): Promise<ClientDocument[]> {
    const params = clientId ? { clientId } : {};
    const response: AxiosResponse<ClientDocument[]> = await this.api.get('/documents', { params });
    return response.data;
  }

  async createDocument(documentData: DocumentCreateRequest): Promise<ClientDocument> {
    const response: AxiosResponse<ClientDocument> = await this.api.post('/documents', documentData);
    return response.data;
  }

  async uploadDocument(formData: FormData): Promise<ClientDocument> {
    const response: AxiosResponse<ClientDocument> = await this.api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async downloadDocument(id: string): Promise<Blob> {
    const response: AxiosResponse<Blob> = await this.api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async deleteDocument(id: string): Promise<void> {
    await this.api.delete(`/documents/${id}`);
  }

  // Payment Methods
  async getPayments(clientId?: string): Promise<Payment[]> {
    const params = clientId ? { clientId } : {};
    const response: AxiosResponse<Payment[]> = await this.api.get('/payments', { params });
    return response.data;
  }

  async createPayment(paymentData: PaymentCreateRequest): Promise<Payment> {
    const response: AxiosResponse<Payment> = await this.api.post('/payments', paymentData);
    return response.data;
  }

  async markPaymentAsPaid(id: string): Promise<Payment> {
    const response: AxiosResponse<Payment> = await this.api.post(`/payments/${id}/pay`);
    return response.data;
  }

  async deletePayment(id: string): Promise<void> {
    await this.api.delete(`/payments/${id}`);
  }

  // Client Notes Methods
  async getClientNotes(clientId?: string): Promise<ClientNote[]> {
    const params = clientId ? { clientId } : {};
    const response: AxiosResponse<ClientNote[]> = await this.api.get('/clientnotes', { params });
    return response.data;
  }

  async createClientNote(noteData: ClientNoteCreateRequest): Promise<ClientNote> {
    const response: AxiosResponse<ClientNote> = await this.api.post('/clientnotes', noteData);
    return response.data;
  }

  async updateClientNote(id: string, noteData: Partial<ClientNoteCreateRequest>): Promise<ClientNote> {
    const response: AxiosResponse<ClientNote> = await this.api.put(`/clientnotes/${id}`, noteData);
    return response.data;
  }

  async deleteClientNote(id: string): Promise<void> {
    await this.api.delete(`/clientnotes/${id}`);
  }

  // Search Methods
  async globalSearch(query: string, lawFirmId?: string, page = 1, pageSize = 20): Promise<GlobalSearchResult> {
    const params = { query, lawFirmId, page, pageSize };
    const response: AxiosResponse<GlobalSearchResult> = await this.api.get('/search/global', { params });
    return response.data;
  }

  async searchClients(query: string, lawFirmId?: string, limit = 10): Promise<any[]> {
    const params = { query, lawFirmId, limit };
    const response: AxiosResponse<any[]> = await this.api.get('/search/clients', { params });
    return response.data;
  }

  async searchDocuments(query: string, lawFirmId?: string, limit = 10): Promise<any[]> {
    const params = { query, lawFirmId, limit };
    const response: AxiosResponse<any[]> = await this.api.get('/search/documents', { params });
    return response.data;
  }

  async searchAppointments(query: string, lawFirmId?: string, limit = 10): Promise<any[]> {
    const params = { query, lawFirmId, limit };
    const response: AxiosResponse<any[]> = await this.api.get('/search/appointments', { params });
    return response.data;
  }

  async searchNotes(query: string, lawFirmId?: string, limit = 10): Promise<any[]> {
    const params = { query, lawFirmId, limit };
    const response: AxiosResponse<any[]> = await this.api.get('/search/notes', { params });
    return response.data;
  }

  async advancedSearch(searchRequest: SearchRequest): Promise<GlobalSearchResult> {
    const response: AxiosResponse<GlobalSearchResult> = await this.api.post('/search/advanced', searchRequest);
    return response.data;
  }

  // Dashboard Methods
  async getDashboardData(lawFirmId?: string): Promise<DashboardData> {
    const params = lawFirmId ? { lawFirmId } : {};
    const response: AxiosResponse<DashboardData> = await this.api.get('/dashboard', { params });
    return response.data;
  }

  // Reports Methods
  async downloadClientReport(clientId: string): Promise<Blob> {
    const response: AxiosResponse<Blob> = await this.api.get(`/reports/client/${clientId}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async downloadInvoice(paymentId: string): Promise<Blob> {
    const response: AxiosResponse<Blob> = await this.api.get(`/reports/invoice/${paymentId}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async downloadMonthlySummary(year: number, month: number, lawFirmId?: string): Promise<Blob> {
    const params = { year, month, lawFirmId };
    const response: AxiosResponse<Blob> = await this.api.get('/reports/monthly-summary', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
