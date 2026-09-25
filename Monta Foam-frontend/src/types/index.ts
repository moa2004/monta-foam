export type Role = "MASTER_ADMIN" | "ADMIN" | "USER";
export type RequestStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type AuthProvider = "LOCAL" | "GOOGLE";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  isVerified: boolean;
  isSuspended?: boolean;
  avatar?: string | null;
  provider?: AuthProvider;
  createdAt?: string;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  image?: string | null;
  isActive: boolean;
  createdAt?: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  linkUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
}

export interface ServiceRequest {
  id: string;
  userId?: string | null;
  serviceId?: string | null;
  service?: Pick<Service, "id" | "title"> | null;
  fullName: string;
  email: string;
  phone: string;
  notes?: string | null;
  status: RequestStatus;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: { page: number; limit: number; total: number; pages: number };
  unreadCount?: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalRequests: number;
  totalServices: number;
  pendingRequests: number;
  newRequestsThisMonth: number;
  newUsersThisMonth: number;
  requestGrowth: string | null;
  userGrowth: string | null;
  recentRequests: ServiceRequest[];
}
