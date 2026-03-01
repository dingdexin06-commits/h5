import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Todo from './Todo.jsx'

function setSession(userRole = 'manager') {
  window.localStorage.setItem(
    'wecom_oa_auth',
    JSON.stringify({
      accessToken: 'token_demo',
      user: {
        id: userRole === 'manager' ? 'u_manager_1' : 'u_1001',
        role: userRole,
        name: userRole,
        department: { id: 'd_01', name: 'dept' },
        roles: []
      }
    })
  )
}

describe('Todo page', () => {
  let fetchMock

  beforeEach(() => {
    window.localStorage.clear()
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    window.localStorage.clear()
  })

  it('loads manager todo list by default and renders rows', async () => {
    setSession('manager')

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
        headers: { Authorization: 'Bearer token_demo' }
      })
    })

    expect(await screen.findByText('Laptop Purchase')).toBeInTheDocument()
    expect(screen.getByText(/u_1001/)).toBeInTheDocument()
  })

  it('loads mine by default for employee and supports scope switching', async () => {
    setSession('employee')

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
      expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/forms?scope=mine', {
        headers: { Authorization: 'Bearer token_demo' }
      })
    })

    const scopeButtons = screen.getAllByRole('button')
    fireEvent.click(scopeButtons[0])

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/forms?scope=todo', {
        headers: { Authorization: 'Bearer token_demo' }
      })
    })
  })
})
