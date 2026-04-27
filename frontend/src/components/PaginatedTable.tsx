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
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {columns.map((col, i) =>
                col ? (
                  <th
                    key={i}
                    className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {col}
                  </th>
                ) : (
                  <th key={i} className="px-4 sm:px-6 py-3" />
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">{children}</tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="border-t border-slate-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-500 order-2 sm:order-1">
            Page {page} of {totalPages} &mdash; {totalCount} total
          </p>
          <div className="flex items-center gap-1 order-1 sm:order-2">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none border border-slate-200 hover:border-slate-300 px-3 py-2 sm:px-2.5 sm:py-1.5 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none border border-slate-200 hover:border-slate-300 px-3 py-2 sm:px-2.5 sm:py-1.5 rounded-lg transition-colors"
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
