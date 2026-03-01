import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Todo from './Todo.jsx'

describe('Todo page', () => {
  let fetchMock

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('loads manager todo list by default and renders rows', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 'f_1',
          title: 'Laptop Purchase',
          content: 'Request 2 dev laptops',
          creatorId: 'u_1001',
          status: 'PENDING',
          createdAt: '2026-03-01T12:00:00.000Z'
        }
      ]
    })

    render(
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Todo />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/forms?scope=todo', {
        headers: { 'x-user-role': 'manager' }
      })
    })

    expect(await screen.findByText('Laptop Purchase')).toBeInTheDocument()
    expect(screen.getByText(/u_1001/)).toBeInTheDocument()
  })

  it('switches role and scope and re-fetches with expected query/header', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => []
    })

    render(
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Todo />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/forms?scope=todo', {
        headers: { 'x-user-role': 'manager' }
      })
    })

    fireEvent.click(screen.getByRole('checkbox'))
    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/forms?scope=todo', {
        headers: {}
      })
    })

    const scopeButtons = screen.getAllByRole('button')
    fireEvent.click(scopeButtons[1])
    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(3, '/api/forms?scope=mine', {
        headers: {}
      })
    })
  })
})
