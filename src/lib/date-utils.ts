export function formatBR(dateStr: string): string {
  if (!dateStr) return ''
  const part = dateStr.split(' ')[0].split('T')[0]
  const [y, m, d] = part.split('-')
  if (!y || !m || !d) return ''
  return `${d}/${m}/${y}`
}

export function parseBR(brDate: string): string {
  const digits = brDate.replace(/\D/g, '')
  if (digits.length !== 8) return ''
  const d = digits.substring(0, 2)
  const m = digits.substring(2, 4)
  const y = digits.substring(4, 8)
  return `${y}-${m}-${d}`
}

export function maskBR(value: string): string {
  const digits = value.replace(/\D/g, '').substring(0, 8)
  let result = ''
  if (digits.length > 0) result += digits.substring(0, 2)
  if (digits.length > 2) result += '/' + digits.substring(2, 4)
  if (digits.length > 4) result += '/' + digits.substring(4, 8)
  return result
}

export function isValidDate(dateStr: string): boolean {
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) return false
  const date = new Date(y, m - 1, d)
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
}
