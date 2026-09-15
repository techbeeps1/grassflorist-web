export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  city?: string;
  district?: string;
  street?: string;
  createdAt: string;
}

export interface UserAddress {
  id: string;
  title: string;
  recipientName: string;
  phone: string;
  city: string;
  district: string;
  street: string;
  isDefault: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  district?: string;
  street?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}
