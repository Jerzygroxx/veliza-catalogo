import React from 'react'

export default function YesNoCell({ cellData }: { cellData?: unknown }) {
  return <span>{cellData === true ? 'Sí' : 'No'}</span>
}
