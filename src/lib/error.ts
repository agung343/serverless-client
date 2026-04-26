type FieldErrors = Record<string, string[]>

export class ApiError extends Error {
    status: number;
    details?: FieldErrors

    constructor(message: string, status: number, details?: FieldErrors) {
        super(message)
        this.status = status
        this.details = details
        Object.setPrototypeOf(this, ApiError.prototype)
    }

    getFieldErrors(field: string): string | undefined {
        return this.details?.[field]?.[0]
    }

    isNotFound() {
        return this.status === 404
    }

    isUnauthorized() {
        return this.status === 403
    }

    isDuplicate() {
        return this.status === 409
    }

    isValidationError() {
        return this.status === 422
    }
}

export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}

export const toApiError = (error: any):ApiError => {
    const message = error.data?.message || "Something went wrong"
    const status = error.status || 500;
    const detail = error.data?.details;
    return new ApiError(message, status, detail)
}