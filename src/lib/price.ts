/** Formatea pesos colombianos sin decimales: 35000 → "$ 35.000". */
export function formatCOP(value: number): string {
  const rounded = Math.round(value)
  const digits = String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${rounded < 0 ? '-' : ''}$ ${digits}`
}
