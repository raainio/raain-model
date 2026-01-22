// GET /rains/:rainId/cumulatives response
export interface CumulativePeriod {
    windowInMinutes: number;
    provider: string;
    timeStepInMinutes: number;
    periodBegin: string;
    periodEnd: string;
    count: number;
}

export interface RaainApiRainsCumulativesListResponse {
    periods: CumulativePeriod[];
    total: number;
}

// Individual cumulative item (when detailed=true)
export interface IndividualCumulative {
    id: string;
    date: string;
    windowInMinutes: number;
    provider: string;
    timeStepInMinutes: number;
}

// Pagination info
export interface PaginationInfo {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

// GET /rains/:rainId/cumulatives?detailed=true response
export interface RaainApiRainsCumulativesDetailedResponse {
    cumulatives: IndividualCumulative[];
    total: number;
    pagination: PaginationInfo;
}
