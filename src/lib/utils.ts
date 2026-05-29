export function formatCurrency(amount: number | null | undefined, currency: 'IDR' | 'USD' = 'IDR'): string {
  if (amount == null) return `IDR 0`;
  
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }
  return `IDR ${amount.toLocaleString('id-ID')}`;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '??';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
