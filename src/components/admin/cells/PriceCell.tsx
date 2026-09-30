import React from 'react'
import { formatCOP } from '../../../lib/price'

export default function PriceCell({ cellData }: { cellData?: unknown }) {
  return <span>{typeof cellData === 'number' ? formatCOP(cellData) : '—'}</span>
}
