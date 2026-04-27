import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  columns: string[]       // empty string = blank action column
  page: number
  totalPages: number
  totalCount: number
  hasPrev: boolean
  hasNext: boolean
  onPrev: () => void
  onNext: () => void
  children: ReactNode     // <tr> elements for tbody
}

export default function PaginatedTable({
  columns,
  page,
  totalPages,
  totalCount,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  children,
}: Props) {
  return (
    <>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((col, i) =>
              col ? (
                <th
                  key={i}
                  className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide"
                >
                  {col}
                </th>
              ) : (
                <th key={i} className="px-6 py-3" />
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>

      {totalPages > 1 && (
        <div className="border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Page {page} of {totalPages} &mdash; {totalCount} total
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none border border-slate-200 hover:border-slate-300 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none border border-slate-200 hover:border-slate-300 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
