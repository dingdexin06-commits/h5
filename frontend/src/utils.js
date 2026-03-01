export const STATUS_LABEL = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
}

export const ACTION_LABEL = {
  APPROVE: 'Approve',
  REJECT: 'Reject'
}

export function getStatusClass(status) {
  switch (status) {
    case 'PENDING':
      return 'badge-warning'
    case 'APPROVED':
      return 'badge-success'
    case 'REJECTED':
      return 'badge-danger'
    default:
      return 'badge-default'
  }
}

export function formatTime(iso) {
  if (!iso) return 'Unknown time'

  const value = new Date(iso)
  if (Number.isNaN(value.getTime())) {
    return iso
  }

  return value.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function buildErrorMessage(payload, fallback) {
  if (!payload || typeof payload !== 'object') {
    return fallback
  }

  const { message } = payload
  if (Array.isArray(message)) {
    return message.join('; ')
  }
  if (typeof message === 'string' && message.trim()) {
    return message
  }
  return fallback
}
