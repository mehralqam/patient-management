import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PaginatedTable from './PaginatedTable'

const defaultProps = {
  columns: ['Patient', 'Date of Birth', 'Age', ''],
  page: 1,
  totalPages: 1,
  totalCount: 5,
  hasPrev: false,
  hasNext: false,
  onPrev: vi.fn(),
  onNext: vi.fn(),
}

function renderTable(props: Partial<typeof defaultProps> = {}) {
  return render(
    <PaginatedTable {...defaultProps} {...props}>
      <tr><td>test row</td></tr>
    </PaginatedTable>
  )
}

describe('PaginatedTable', () => {
  it('renders column headers', () => {
    renderTable()
    expect(screen.getByText('Patient')).toBeInTheDocument()
    expect(screen.getByText('Date of Birth')).toBeInTheDocument()
    expect(screen.getByText('Age')).toBeInTheDocument()
  })

  it('renders children rows', () => {
    renderTable()
    expect(screen.getByText('test row')).toBeInTheDocument()
  })

  it('hides pagination when totalPages is 1', () => {
    renderTable({ totalPages: 1 })
    expect(screen.queryByText(/prev/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/next/i)).not.toBeInTheDocument()
  })

  it('shows pagination controls when totalPages > 1', () => {
    renderTable({ totalPages: 3, page: 2, hasPrev: true, hasNext: true })
    expect(screen.getByText(/prev/i)).toBeInTheDocument()
    expect(screen.getByText(/next/i)).toBeInTheDocument()
  })

  it('shows correct page info', () => {
    renderTable({ totalPages: 5, page: 3, totalCount: 48, hasPrev: true, hasNext: true })
    expect(screen.getByText(/page 3 of 5/i)).toBeInTheDocument()
    expect(screen.getByText(/48 total/i)).toBeInTheDocument()
  })

  it('disables prev button when hasPrev is false', () => {
    renderTable({ totalPages: 3, hasPrev: false, hasNext: true })
    expect(screen.getByRole('button', { name: /prev/i })).toBeDisabled()
  })

  it('disables next button when hasNext is false', () => {
    renderTable({ totalPages: 3, hasPrev: true, hasNext: false })
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('calls onPrev when prev button is clicked', async () => {
    const onPrev = vi.fn()
    renderTable({ totalPages: 3, hasPrev: true, hasNext: true, onPrev })
    await userEvent.click(screen.getByRole('button', { name: /prev/i }))
    expect(onPrev).toHaveBeenCalledOnce()
  })

  it('calls onNext when next button is clicked', async () => {
    const onNext = vi.fn()
    renderTable({ totalPages: 3, hasPrev: true, hasNext: true, onNext })
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(onNext).toHaveBeenCalledOnce()
  })
})
