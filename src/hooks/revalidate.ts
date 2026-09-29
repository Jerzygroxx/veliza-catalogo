import { revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  RequestContext,
} from 'payload'
import type { CacheTag } from '../lib/cache-tags'

/** Marca las etiquetas como vencidas: la siguiente visita trae datos frescos. */
export function expireTags(tags: readonly CacheTag[], context: RequestContext): void {
  if (context.disableRevalidate) return
  for (const tag of tags) revalidateTag(tag, { expire: 0 })
}

export const revalidateAfterChange =
  (tags: readonly CacheTag[]): CollectionAfterChangeHook =>
  ({ doc, context }) => {
    expireTags(tags, context)
    return doc
  }

export const revalidateAfterDelete =
  (tags: readonly CacheTag[]): CollectionAfterDeleteHook =>
  ({ doc, context }) => {
    expireTags(tags, context)
    return doc
  }

export const revalidateGlobalAfterChange =
  (tags: readonly CacheTag[]): GlobalAfterChangeHook =>
  ({ doc, context }) => {
    expireTags(tags, context)
    return doc
  }
