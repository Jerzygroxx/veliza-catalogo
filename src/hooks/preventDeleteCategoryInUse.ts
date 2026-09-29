import { APIError, type CollectionBeforeDeleteHook } from 'payload'

export const preventDeleteCategoryInUse: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const { totalDocs } = await req.payload.count({
    collection: 'products',
    where: { category: { equals: id } },
    overrideAccess: true,
    req,
  })
  if (totalDocs > 0) {
    throw new APIError(
      `No puedes borrar esta categoría porque tiene ${totalDocs} producto(s). Muévelos a otra categoría o bórralos primero.`,
      400,
      undefined,
      true,
    )
  }
}
