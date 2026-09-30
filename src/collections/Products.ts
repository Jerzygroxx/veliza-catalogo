import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { slugField } from '../fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { CACHE_TAGS } from '../lib/cache-tags'
import { validateHex, validatePrice } from '../lib/validators'

const tags = [CACHE_TAGS.products] as const

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Prenda', plural: 'Prendas' },
  admin: {
    group: 'Catálogo',
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'price', 'soldOut', 'featured'],
    listSearchableFields: ['name'],
  },
  defaultSort: '-createdAt',
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  hooks: {
    afterChange: [revalidateAfterChange(tags)],
    afterDelete: [revalidateAfterDelete(tags)],
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Nombre / referencia' },
    slugField('products'),
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      label: 'Categoría',
      admin: { position: 'sidebar' },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      label: 'Precio (COP)',
      validate: validatePrice,
      admin: { step: 1000, description: 'En pesos, sin puntos ni signos. Ej: 35000' },
    },
    { name: 'size', type: 'text', label: 'Talla', defaultValue: 'Talla única (S–M)' },
    {
      name: 'colors',
      type: 'array',
      label: 'Colores',
      labels: { singular: 'Color', plural: 'Colores' },
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Nombre del color' },
        {
          name: 'swatch',
          type: 'text',
          label: 'Muestra (opcional)',
          validate: validateHex,
          admin: { description: 'Código de color. Ej: #000000 para negro.' },
        },
      ],
    },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: true,
      label: 'Fotos',
      admin: { description: 'La primera es la portada. Arrastra para cambiar el orden.' },
    },
    { name: 'description', type: 'textarea', label: 'Descripción corta' },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Destacado (aparece en el inicio)',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'soldOut',
      type: 'checkbox',
      label: 'Agotada',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
  ],
}
