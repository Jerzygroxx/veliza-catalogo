import { getPayload } from 'payload'
import config from '../payload.config'
import { seedData } from './data'
import { createCatalogImageLoader } from './images'
import { seed } from './seed'

const payload = await getPayload({ config })
const report = await seed(payload, seedData, createCatalogImageLoader(process.env.SEED_ASSETS_DIR || 'seed-assets'))
payload.logger.info(
  `Seed listo: ${report.categoriesCreated} categorías y ${report.productsCreated} productos nuevos; ` +
    `configuración ${report.settingsFilled ? 'llenada' : 'sin cambios (ya tenía datos)'}.`,
)
process.exit(0)
