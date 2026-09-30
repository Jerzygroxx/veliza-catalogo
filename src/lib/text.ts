/** Separa un texto en párrafos por líneas en blanco, sin párrafos vacíos. */
export function paragraphs(text: string | null | undefined): string[] {
  if (!text) return []
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}
