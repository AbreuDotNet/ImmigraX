import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from '../config';
import {
  DocumentCategory,
  DocumentCategorySimple,
  DocumentTag,
  DocumentUserPermission,
  DocumentPermissionCheck,
  CreateDocumentCategoryDto,
  CreateDocumentTagDto,
  CreateDocumentUserPermissionDto,
  BulkDocumentPermissionDto,
  DocumentAccessLevel
} from '../types';

class DocumentPermissionService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
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
  }

  // ===== CATEGORÍAS =====
  async getCategories(): Promise<DocumentCategory[]> {
    const response = await this.api.get('/documents/categories');
    return response.data;
  }

  async getCategoriesSimple(): Promise<DocumentCategorySimple[]> {
    const response = await this.api.get('/documents/categories/simple');
    return response.data;
  }

  async createCategory(category: CreateDocumentCategoryDto): Promise<DocumentCategory> {
    const response = await this.api.post('/documents/categories', category);
    return response.data;
  }

  async updateCategory(id: string, category: Partial<CreateDocumentCategoryDto>): Promise<DocumentCategory> {
    const response = await this.api.put(`/documents/categories/${id}`, category);
    return response.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await this.api.delete(`/documents/categories/${id}`);
  }

  // ===== ETIQUETAS =====
  async getTags(): Promise<DocumentTag[]> {
    const response = await this.api.get('/documents/tags');
    return response.data;
  }

  async createTag(tag: CreateDocumentTagDto): Promise<DocumentTag> {
    const response = await this.api.post('/documents/tags', tag);
    return response.data;
  }

  async updateTag(id: string, tag: Partial<CreateDocumentTagDto>): Promise<DocumentTag> {
    const response = await this.api.put(`/documents/tags/${id}`, tag);
    return response.data;
  }

  async deleteTag(id: string): Promise<void> {
    await this.api.delete(`/documents/tags/${id}`);
  }

  async assignTagsToDocument(documentId: string, tagIds: string[]): Promise<void> {
    await this.api.post('/documents/tags/assign', { documentId, tagIds });
  }

  async removeTagFromDocument(documentId: string, tagId: string): Promise<void> {
    await this.api.delete(`/documents/tags/assign/${documentId}/${tagId}`);
  }

  // ===== PERMISOS DE DOCUMENTOS =====
  async getDocumentPermissions(documentId: string): Promise<DocumentUserPermission[]> {
    const response = await this.api.get(`/documents/${documentId}/permissions`);
    return response.data;
  }

  async checkUserPermissions(documentId: string, userId?: string): Promise<DocumentPermissionCheck> {
    const url = userId 
      ? `/documents/${documentId}/permissions/check?userId=${userId}`
      : `/documents/${documentId}/permissions/check`;
    const response = await this.api.get(url);
    return response.data;
  }

  async grantPermission(permission: CreateDocumentUserPermissionDto): Promise<DocumentUserPermission> {
    const response = await this.api.post('/documents/permissions', permission);
    return response.data;
  }

  async updatePermission(permissionId: string, permission: Partial<CreateDocumentUserPermissionDto>): Promise<DocumentUserPermission> {
    const response = await this.api.put(`/documents/permissions/${permissionId}`, permission);
    return response.data;
  }

  async revokePermission(permissionId: string): Promise<void> {
    await this.api.delete(`/documents/permissions/${permissionId}`);
  }

  async grantBulkPermissions(bulkPermissions: BulkDocumentPermissionDto): Promise<DocumentUserPermission[]> {
    const response = await this.api.post('/documents/permissions/bulk', bulkPermissions);
    return response.data;
  }

  // ===== UTILIDADES =====
  getAccessLevelColor(level: DocumentAccessLevel): string {
    switch (level) {
      case DocumentAccessLevel.Public:
        return '#4caf50'; // Verde
      case DocumentAccessLevel.Restricted:
        return '#ff9800'; // Naranja
      case DocumentAccessLevel.Confidential:
        return '#f44336'; // Rojo
      case DocumentAccessLevel.HighlyConfidential:
        return '#9c27b0'; // Púrpura
      default:
        return '#757575'; // Gris
    }
  }

  getAccessLevelIcon(level: DocumentAccessLevel): string {
    switch (level) {
      case DocumentAccessLevel.Public:
        return 'public';
      case DocumentAccessLevel.Restricted:
        return 'lock';
      case DocumentAccessLevel.Confidential:
        return 'security';
      case DocumentAccessLevel.HighlyConfidential:
        return 'enhanced_encryption';
      default:
        return 'help';
    }
  }

  getAccessLevelDescription(level: DocumentAccessLevel): string {
    switch (level) {
      case DocumentAccessLevel.Public:
        return 'Visible para todos los miembros de la firma legal';
      case DocumentAccessLevel.Restricted:
        return 'Solo visible para usuarios con permisos específicos';
      case DocumentAccessLevel.Confidential:
        return 'Solo visible para abogados y administradores';
      case DocumentAccessLevel.HighlyConfidential:
        return 'Solo visible para administradores principales';
      default:
        return 'Nivel de acceso desconocido';
    }
  }

  formatFileSize(bytes?: number): string {
    if (!bytes) return 'Tamaño desconocido';
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  canUserPerformAction(
    userRole: string, 
    documentAccessLevel: DocumentAccessLevel, 
    userPermissions: Partial<DocumentUserPermission>, 
    action: 'view' | 'edit' | 'delete' | 'share'
  ): boolean {
    // Lógica de permisos basada en rol y nivel de acceso
    const isMaster = userRole === 'Master';
    const isAbogado = userRole === 'Abogado';
    
    // Los masters siempre tienen todos los permisos
    if (isMaster) return true;
    
    // Para documentos altamente confidenciales, solo masters
    if (documentAccessLevel === DocumentAccessLevel.HighlyConfidential && !isMaster) {
      return false;
    }
    
    // Para documentos confidenciales, solo abogados y masters
    if (documentAccessLevel === DocumentAccessLevel.Confidential && !isAbogado && !isMaster) {
      return false;
    }
    
    // Verificar permisos específicos del usuario
    switch (action) {
      case 'view':
        return userPermissions.canView ?? false;
      case 'edit':
        return userPermissions.canEdit ?? false;
      case 'delete':
        return userPermissions.canDelete ?? false;
      case 'share':
        return userPermissions.canShare ?? false;
      default:
        return false;
    }
  }
}

const documentPermissionService = new DocumentPermissionService();
export default documentPermissionService;
