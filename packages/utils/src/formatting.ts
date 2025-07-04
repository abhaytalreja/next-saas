import { format, formatDistance, formatRelative } from 'date-fns'

export function formatDate(date: Date | string | number): string {
  return format(new Date(date), 'PPP')
}

export function formatDateTime(date: Date | string | number): string {
  return format(new Date(date), 'PPP p')
}

export function formatRelativeDate(date: Date | string | number): string {
  return formatRelative(new Date(date), new Date())
}

export function formatDistanceFromNow(date: Date | string | number): string {
  return formatDistance(new Date(date), new Date(), { addSuffix: true })
}

export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount / 100) // Assuming amount is in cents
}

export function formatNumber(
  num: number,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale).format(num)
}

export function formatPercentage(
  num: number,
  decimals: number = 0
): string {
  return `${(num * 100).toFixed(decimals)}%`
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function titleCase(str: string): string {
  return str
    .split(' ')
    .map(word => capitalize(word))
    .join(' ')
}