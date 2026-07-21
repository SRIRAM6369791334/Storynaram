export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Story {
  id: string;
  title: string;
  description?: string;
  status: string;
  genres: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Character {
  id: string;
  name: string;
  role?: string;
  species?: string;
  storyId?: string;
  createdAt: string;
}

export interface World {
  id: string;
  name: string;
  description?: string;
  genre?: string;
  createdAt: string;
}

export interface Timeline {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface CanonEntry {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Narrative {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
}

export interface Composition {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
}

export interface Publication {
  id: string;
  storyId: string;
  status: string;
  formats?: string[];
  createdAt: string;
}

export interface SearchResult<T = unknown> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  checks: Record<string, { status: string; details?: string }>;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrevious: boolean };
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
}
