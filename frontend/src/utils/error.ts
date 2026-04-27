import type { AxiosError } from 'axios'

/**
 * Extracts a human-readable error message from a DRF API error response.
 * DRF returns errors as `{ field: ["error1", "error2"], ... }`.
 * This flattens all field errors into a single string.
 */
export function extractApiError(error: unknown): string | undefined {
  const axiosError = error as AxiosError<Record<string, string[]>>
  const data = axiosError.response?.data
  if (data && typeof data === 'object') {
    return Object.values(data).flat().join(' ')
  }
  return undefined
}
