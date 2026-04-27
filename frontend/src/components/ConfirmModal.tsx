import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

interface Props {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  isLoading?: boolean
  variant?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading = false,
  variant = 'default',
  onConfirm,
  onCancel,
}: Props) {
  const isDanger = variant === 'danger'

  return (
    <Modal title={title} onClose={onCancel}>
      <div className="px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex gap-4">
          {isDanger && (
            <div className="shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          )}
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full sm:flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg disabled:opacity-50 transition-colors ${
              isDanger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-sky-600 hover:bg-sky-700'
            }`}
          >
            {isLoading ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
