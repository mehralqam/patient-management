import toast from 'react-hot-toast'

/**
 * Centralized toast notifications with consistent messaging.
 * 
 * Message format guidelines:
 * - Success: Past tense, concise (e.g., "Patient added")
 * - Error: Brief description of what failed (e.g., "Failed to add patient")
 * - Use sentence case, no periods
 */

export const toasts = {
  // Auth
  loginSuccess: () => toast.success('Signed in successfully'),
  loginError: () => toast.error('Invalid username or password'),
  logoutSuccess: () => toast.success('Signed out'),

  // Patient CRUD
  patientCreated: () => toast.success('Patient added'),
  patientUpdated: () => toast.success('Patient updated'),
  patientDeleted: () => toast.success('Patient deleted'),

  // Errors with optional detail
  createError: (detail?: string) =>
    toast.error(detail ?? 'Failed to add patient'),
  updateError: (detail?: string) =>
    toast.error(detail ?? 'Failed to update patient'),
  deleteError: (detail?: string) =>
    toast.error(detail ?? 'Failed to delete patient'),

  // Generic
  error: (message: string) => toast.error(message),
  success: (message: string) => toast.success(message),
}

export { toast }
