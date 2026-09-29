import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { slugField } from '../fields/slug'
import { preventDeleteCategoryInUse } from '../hooks/preventDeleteCategoryInUse'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { CACHE_TAGS } from '../lib/cache-tags'

const tags = [CACHE_TAGS.categories, CACHE_TAGS.products] as const

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Categoría', plural: 'Categorías' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'order', 'updatedAt'] },
  defaultSort: 'order',
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  hooks: {
    beforeDelete: [preventDeleteCategoryInUse],
    afterChange: [revalidateAfterChange(tags)],
    afterDelete: [revalidateAfterDelete(tags)],
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Nombre' },
    slugField('categories'),
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Foto para el inicio' },
    {
      name: 'order',
      type: 'number',
      label: 'Orden',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Se muestran de menor a mayor.' },
    },
  ],
}
