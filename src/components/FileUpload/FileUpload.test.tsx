import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { FileUpload } from './FileUpload'

function makeFile(name: string, type: string, size = 100): File {
  return new File(['x'.repeat(size)], name, { type })
}

describe('FileUpload', () => {
  it('applies the base class and merges className', () => {
    const { container } = render(<FileUpload className="custom" />)
    expect(container.firstElementChild).toHaveClass('hal-file-upload', 'custom')
  })

  it('adds files from the native input', async () => {
    const onFilesChange = vi.fn()
    render(<FileUpload onFilesChange={onFilesChange} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = makeFile('notes.txt', 'text/plain')
    await userEvent.upload(input, file)
    expect(onFilesChange).toHaveBeenCalledWith([file])
    expect(screen.getByText('notes.txt')).toBeInTheDocument()
  })

  it('filters by accept and maxSize', async () => {
    const onFilesChange = vi.fn()
    render(<FileUpload accept="image/*" maxSize={50} onFilesChange={onFilesChange} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, makeFile('big.png', 'image/png', 200))
    expect(onFilesChange).not.toHaveBeenCalled()
    await userEvent.upload(input, makeFile('small.png', 'image/png', 40))
    expect(onFilesChange).toHaveBeenCalled()
  })

  it('removes a file from the list', async () => {
    const onFilesChange = vi.fn()
    render(<FileUpload defaultFiles={[makeFile('a.txt', 'text/plain')]} onFilesChange={onFilesChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(onFilesChange).toHaveBeenCalledWith([])
  })

  it('shows an image preview', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview')
    render(<FileUpload defaultFiles={[makeFile('photo.png', 'image/png')]} />)
    await waitFor(() => {
      expect(document.querySelector('.hal-file-upload__preview')).toHaveAttribute(
        'src',
        'blob:preview',
      )
    })
    createObjectURL.mockRestore()
  })

  it('handles drop events', () => {
    const onFilesChange = vi.fn()
    const { container } = render(<FileUpload onFilesChange={onFilesChange} />)
    const zone = container.querySelector('.hal-file-upload__dropzone')!
    const file = makeFile('drop.txt', 'text/plain')
    fireEvent.drop(zone, {
      dataTransfer: { files: [file] },
    })
    expect(onFilesChange).toHaveBeenCalledWith([file])
  })

  it('forwards ref to the root', () => {
    const ref = createRef<HTMLDivElement>()
    render(<FileUpload ref={ref} />)
    expect(ref.current).toHaveClass('hal-file-upload')
  })

  it('has no axe violations', async () => {
    const { container } = render(<FileUpload />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
