import apiService from './apiService';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lawFirms: string[];
}

export interface CreateUserData {
  fullName: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
}

export interface UpdateUserData {
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  newPassword?: string;
}

export interface UserRole {
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
}

class UserService {
  async getUsers(): Promise<User[]> {
    const response = await (apiService as any).api.get('/users');
    return response.data;
  }

  async getUser(id: string): Promise<User> {
    const response = await (apiService as any).api.get(`/users/${id}`);
    return response.data;
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const response = await (apiService as any).api.post('/users', userData);
    return response.data;
  }

  async updateUser(id: string, userData: UpdateUserData): Promise<void> {
    await (apiService as any).api.put(`/users/${id}`, userData);
  }

  async deleteUser(id: string): Promise<void> {
    await (apiService as any).api.delete(`/users/${id}`);
  }

  async activateUser(id: string): Promise<void> {
    await (apiService as any).api.post(`/users/${id}/activate`);
  }

  async getRoles(): Promise<UserRole[]> {
    const response = await (apiService as any).api.get('/users/roles');
    return response.data;
  }
}

export const userService = new UserService();
