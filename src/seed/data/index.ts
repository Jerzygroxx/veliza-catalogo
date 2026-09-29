import type { SeedData } from '../types'
import { categories } from './categories'
import { products } from './products'
import { siteSettings } from './site-settings'

export const seedData: SeedData = { categories, products, siteSettings }
