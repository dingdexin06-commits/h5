import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import FormCreate from './FormCreate.jsx'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock
  }
})

describe('FormCreate page', () => {
  let fetchMock

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    navigateMock.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('shows validation error when title/content are empty', async () => {
    render(
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <FormCreate />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button'))

    expect(fetchMock).not.toHaveBeenCalled()
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('posts form and navigates to detail on success', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'f_1' })
    })

    render(
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <FormCreate />
      </MemoryRouter>
    )

    const textboxes = screen.getAllByRole('textbox')
    fireEvent.change(textboxes[0], {
      target: { value: '  Laptop Purchase  ' }
    })
    fireEvent.change(textboxes[1], {
      target: { value: '  Request 2 dev laptops  ' }
    })
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/forms')
    expect(options.method).toBe('POST')
    expect(options.headers).toEqual({ 'Content-Type': 'application/json' })
    expect(JSON.parse(options.body)).toEqual({
      title: 'Laptop Purchase',
      content: 'Request 2 dev laptops'
    })

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/forms/f_1', { replace: true })
    })
  })
})
