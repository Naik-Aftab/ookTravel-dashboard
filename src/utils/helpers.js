import { format, formatDistanceToNow } from 'date-fns';

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
}

export function formatDate(date) {
  if (!date) return '—';
  return format(new Date(date), 'dd MMM yyyy');
}

export function formatDateTime(date) {
  if (!date) return '—';
  return format(new Date(date), 'dd MMM yyyy, hh:mm a');
}

export function timeAgo(date) {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getStatusColor(status) {
  const map = {
    active:      'green',
    approved:    'green',
    issued:      'green',
    paid:        'green',
    verified:    'green',
    pending:     'yellow',
    partial:     'yellow',
    submitted:   'blue',
    assigned:    'blue',
    under_review:'purple',
    suspended:   'red',
    rejected:    'red',
    expired:     'gray',
    claimed:     'orange',
    cancelled:   'gray',
  };
  return map[status] || 'gray';
}

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
}

export function buildQueryString(params) {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}
