import type { CollectionConfig } from 'payload'
import { authenticated } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Usuaria', plural: 'Usuarias' },
  admin: { useAsTitle: 'email', defaultColumns: ['name', 'email'] },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [{ name: 'name', type: 'text', label: 'Nombre' }],
}
