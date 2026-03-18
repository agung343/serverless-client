export type ApiError = {
    message: string
    statusCode: number
    details?: Record<string, string[]>
}