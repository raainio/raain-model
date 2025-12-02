// Generic error response
export interface ErrorResponse {
    error: string;
}

// Specific errors
export type ErrorNotFoundResponse = ErrorResponse;

export type ErrorBadRequestResponse = ErrorResponse;

export type ErrorInternalProblemResponse = ErrorResponse;

export type ErrorAuthenticationResponse = ErrorResponse;

export type ErrorAuthorizedResponse = ErrorResponse;
