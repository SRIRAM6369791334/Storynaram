export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export function successResponse<T>(data: T, message?: string, requestId?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    requestId,
  };
}

export function errorResponse(error: string, message?: string, requestId?: string): ApiResponse<never> {
  return {
    success: false,
    error,
    message,
    timestamp: new Date().toISOString(),
    requestId,
  };
}
