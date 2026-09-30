import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'

const webp = { format: 'webp' as const, options: { quality: 82 } }

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Foto', plural: 'Fotos' },
  admin: { group: 'Catálogo' },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Descripción de la imagen',
      admin: {
        description: 'Para personas con lector de pantalla. Ej: "Body Cloe negro, vista de frente".',
      },
    },
  ],
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 500, position: 'centre', formatOptions: webp },
      { name: 'card', width: 800, height: 1000, position: 'centre', formatOptions: webp },
      { name: 'full', width: 1600, withoutEnlargement: true, formatOptions: webp },
    ],
  },
}
