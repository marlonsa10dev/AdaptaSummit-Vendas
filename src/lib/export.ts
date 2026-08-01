interface ExportColumn {
  key: string
  label: string
}

export function exportToCSV(
  filename: string,
  columns: ExportColumn[],
  rows: Record<string, unknown>[],
) {
  const escape = (val: unknown): string => {
    const str = val == null ? '' : String(val)
    return `"${str.replace(/"/g, '""')}"`
  }

  const header = columns.map((c) => escape(c.label)).join(',')
  const body = rows.map((row) => columns.map((c) => escape(row[c.key])).join(',')).join('\n')
  const csv = '\ufeff' + header + '\n' + body

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
