export const STATUS_LABEL = {
  PENDING: '待审批',
  APPROVED: '已同意',
  REJECTED: '已拒绝'
}

export const ACTION_LABEL = {
  APPROVE: '同意',
  REJECT: '拒绝'
}

export function getStatusClass(status) {
  switch (status) {
    case 'PENDING': return 'badge-warning';
    case 'APPROVED': return 'badge-success';
    case 'REJECTED': return 'badge-danger';
    default: return 'badge-default';
  }
}

export function formatTime(iso) {
  if (!iso) return '未知时间';
  const value = new Date(iso)
  if (Number.isNaN(value.getTime())) {
    return iso
  }
  return value.toLocaleString('zh-CN', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
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
