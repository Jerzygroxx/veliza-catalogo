export type PurchaseState = 'sold-out' | 'needs-color' | 'ready'

export function purchaseState({
  colorCount,
  selected,
  soldOut,
}: {
  colorCount: number
  selected: string | null
  soldOut: boolean
}): PurchaseState {
  if (soldOut) return 'sold-out'
  if (colorCount > 0 && !selected) return 'needs-color'
  return 'ready'
}
