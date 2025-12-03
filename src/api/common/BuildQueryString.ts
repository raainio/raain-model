export function BuildQueryString<T extends object | void>(params: T): string {
    if (!params || typeof params !== 'object') {
        return '';
    }

    const queryParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
        }
    }

    return queryParams.toString();
}
