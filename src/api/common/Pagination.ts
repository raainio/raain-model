export interface PaginationRequest {
    page?: number; // >= 1, default: 1
    limit?: number; // 1-100, default: 100
}

export interface PaginationResponse {
    pagination: {
        page: number;
        limit: number;

        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
