export interface PaginationRequest {
    page: number; // >= 1, default: 1
    limit: number; // 1-100, default: 100
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
