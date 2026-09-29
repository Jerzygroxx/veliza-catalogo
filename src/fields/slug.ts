import type { Field, FieldHook } from 'payload'
import { slugify } from '../lib/slugify'

type SluggedCollection = 'products' | 'categories'

/** Devuelve `base`, o `base-2`, `base-3`… según el primero que esté libre. */
export async function findAvailableSlug(
  base: string,
  isTaken: (candidate: string) => Promise<boolean>,
): Promise<string> {
  let candidate = base
  for (let n = 2; await isTaken(candidate); n++) candidate = `${base}-${n}`
  return candidate
}

const formatSlug =
  (collection: SluggedCollection, source: string): FieldHook =>
  async ({ value, data, originalDoc, req }) => {
    const typed = typeof value === 'string' && value.trim() ? value : undefined
    // Si no llega un slug (p. ej. solo se editó el precio), se conserva el actual.
    const raw = typed ?? originalDoc?.slug ?? String(data?.[source] ?? '')
    const base = slugify(raw)
    if (!base) return base
    const currentId = originalDoc?.id
    return findAvailableSlug(base, async (candidate) => {
      const { totalDocs } = await req.payload.count({
        collection,
        where: {
          and: [
            { slug: { equals: candidate } },
            ...(currentId ? [{ id: { not_equals: currentId } }] : []),
          ],
        },
        overrideAccess: true,
        req,
      })
      return totalDocs > 0
    })
  }

export const slugField = (collection: SluggedCollection, source = 'name'): Field => ({
  name: 'slug',
  type: 'text',
  label: 'Slug (dirección web)',
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Se genera solo a partir del nombre. Ej: "Body Cloe" → body-cloe.',
  },
  hooks: { beforeValidate: [formatSlug(collection, source)] },
})
