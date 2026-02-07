// GET /rains/:rainId/cumulatives response
// provider/timeStepInMinutes are for quality comparison only, not cumulative images
export interface CumulativePeriod {
    windowInMinutes: number;
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
