export function statusBadgeClass(status: string) {
  const map: Record<string, string> = {
    PENDING: 'status-pending',
    PAID: 'status-paid',
    PROCESSING: 'status-processing',
    SHIPPED: 'status-shipped',
    DELIVERED: 'status-delivered',
    CANCELLED: 'status-cancelled',
  };
  return `status-badge ${map[status] || 'status-pending'}`;
}
