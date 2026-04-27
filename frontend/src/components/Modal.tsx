import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
}

export default function Modal({ title, subtitle, onClose, children }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-t-xl sm:rounded-xl border border-slate-200 shadow-xl w-full sm:max-w-md sm:mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 -mr-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  )
}
