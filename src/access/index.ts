import type { Access } from 'payload'

/** Cualquier visitante, con o sin sesión. */
export const anyone: Access = () => true

/** Solo usuarias con sesión iniciada en el panel. */
export const authenticated: Access = ({ req }) => Boolean(req.user)

/** Usuarias con sesión, pero solo sobre su propio registro. */
export const ownAccount: Access = ({ req }) => {
  if (!req.user) return false
  return { id: { equals: req.user.id } }
}
