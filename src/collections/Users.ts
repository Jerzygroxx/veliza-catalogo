import { APIError, type CollectionConfig } from 'payload'
import { authenticated, ownAccount } from '../access'
import { sessionCookies, validatePasswordLength } from '../lib/auth-policy'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Usuaria', plural: 'Usuarias' },
  admin: { group: 'Tienda', useAsTitle: 'email', defaultColumns: ['name', 'email'] },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    cookies: sessionCookies(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: ownAccount,
    delete: ownAccount,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (typeof data?.password === 'string') {
          const result = validatePasswordLength(data.password)
          if (result !== true) throw new APIError(result, 400, undefined, true)
        }
        return data
      },
    ],
  },
  fields: [{ name: 'name', type: 'text', label: 'Nombre' }],
}
