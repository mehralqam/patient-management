import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PatientListItem from './PatientListItem'
import type { Patient } from '../types'

const patient: Patient = {
  id: 1,
  first_name: 'John',
  last_name: 'Doe',
  date_of_birth: '1990-01-15',
  clinic: 1,
  clinic_name: 'Test Clinic',
  appointments: [],
}

function renderRow(props: Partial<Parameters<typeof PatientListItem>[0]> = {}) {
  return render(
    <table>
      <tbody>
        <PatientListItem
          patient={patient}
          isDeleting={false}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          {...props}
        />
      </tbody>
    </table>
  )
}

describe('PatientListItem', () => {
  it('renders the patient full name', () => {
    renderRow()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('renders initials avatar', () => {
    renderRow()
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('renders date of birth', () => {
    renderRow()
    expect(screen.getByText('1990-01-15')).toBeInTheDocument()
  })

  it('renders age as a positive number', () => {
    renderRow()
    expect(screen.getByText(/\d+ yrs/)).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn()
    renderRow({ onEdit })
    await userEvent.click(screen.getByTitle('Edit'))
    expect(onEdit).toHaveBeenCalledOnce()
  })

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn()
    renderRow({ onDelete })
    await userEvent.click(screen.getByTitle('Delete'))
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('disables both buttons when isDeleting is true', () => {
    renderRow({ isDeleting: true })
    expect(screen.getByTitle('Edit')).toBeDisabled()
    expect(screen.getByTitle('Delete')).toBeDisabled()
  })
})
