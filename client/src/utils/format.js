// Display helpers.

// 1299.5 -> "N$ 1,299.50"; whole amounts drop the cents: 299 -> "N$ 299"
export function formatPrice(amount) {
  const value = Number(amount) || 0;
  const hasCents = Math.round(value * 100) % 100 !== 0;
  return `N$ ${value.toLocaleString('en-US', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

// "13 Oct 2026, 14:05" from the ISO timestamps the API sends.
export function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Today as 'YYYY-MM-DD' in local time - the format <input type="date"> uses.
export function todayAsInputValue() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}
