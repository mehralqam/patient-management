import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from './Modal'

function renderModal(props: { subtitle?: string; onClose?: () => void } = {}) {
  const onClose = props.onClose ?? vi.fn()
  return {
    onClose,
    ...render(
      <Modal title="Test Title" onClose={onClose} {...props}>
        <p>modal content</p>
      </Modal>
    ),
  }
}

describe('Modal', () => {
  it('renders the title', () => {
    renderModal()
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('renders children', () => {
    renderModal()
    expect(screen.getByText('modal content')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    renderModal({ subtitle: 'Some subtitle' })
    expect(screen.getByText('Some subtitle')).toBeInTheDocument()
  })

  it('does not render subtitle when omitted', () => {
    renderModal()
    expect(screen.queryByText('Some subtitle')).not.toBeInTheDocument()
  })

  it('calls onClose when X button is clicked', async () => {
    const { onClose } = renderModal()
    await userEvent.click(screen.getByRole('button'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when backdrop is clicked', async () => {
    const onClose = vi.fn()
    const { container } = render(
      <Modal title="T" onClose={onClose}>
        <p>content</p>
      </Modal>
    )
    const backdrop = container.firstChild as HTMLElement
    await userEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not call onClose when inner content is clicked', async () => {
    const { onClose } = renderModal()
    await userEvent.click(screen.getByText('modal content'))
    expect(onClose).not.toHaveBeenCalled()
  })
})
